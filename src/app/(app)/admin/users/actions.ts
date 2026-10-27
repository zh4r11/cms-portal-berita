"use server";

import { randomUUID } from "node:crypto";
import { refresh } from "next/cache";
import { z } from "zod";
import { failure, fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { hashPassword } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { emailSchema, passwordSchema, pilihan, teks, teksOpsional, usernameSchema } from "@/lib/validation";

const schema = z.object({
  name: teks("Nama lengkap", 100),
  username: usernameSchema,
  email: emailSchema,
  noTelp: teksOpsional("No. telepon", 30),
  level: pilihan("Level", ["admin", "user"] as const),
  password: z.string().default(""),
  modul: z.array(z.coerce.number().int().positive()).default([]),
});

async function simpan(id: string | null, input: unknown): Promise<ActionResult> {
  await requireModul("users");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const { password, modul, ...data } = parsed.data;
  const lama = id ? await prisma.user.findUniqueOrThrow({ where: { id } }) : null;
  const errors: Record<string, string> = {};

  if (!id || password) {
    const cek = passwordSchema.safeParse(password);

    if (!cek.success) errors.password = cek.error.issues[0].message;
  }

  if (lama && isSuperAdmin(lama.username)) {
    if (data.username !== lama.username) errors.username = "Username akun admin utama tidak dapat diubah.";
    if (data.level !== "admin") errors.level = "Akun admin utama harus tetap berlevel admin.";
  }

  const [usernameDipakai, emailDipakai] = await Promise.all([
    prisma.user.count({ where: { username: data.username, ...(id && { NOT: { id } }) } }),
    prisma.user.count({ where: { email: data.email, ...(id && { NOT: { id } }) } }),
  ]);
  if (usernameDipakai) errors.username = "Username sudah digunakan.";
  if (emailDipakai) errors.email = "Email sudah digunakan.";

  if (Object.keys(errors).length) {
    return fieldErrors(errors);
  }

  const hash = password ? await hashPassword(password) : null;
  // Hak akses per modul hanya berlaku untuk level user; admin membuka semua modul.
  const modulValid =
    data.level === "user"
      ? (await prisma.modul.findMany({ where: { id: { in: modul }, status: "user" }, select: { id: true } })).map((m) => m.id)
      : [];

  await prisma.$transaction(async (tx) => {
    const userId = id ?? randomUUID();
    const values = { ...data, displayUsername: data.username };

    if (id) {
      await tx.user.update({ where: { id }, data: values });
    } else {
      await tx.user.create({ data: { id: userId, ...values, emailVerified: true } });
    }

    if (hash) {
      const akun = await tx.account.findFirst({ where: { userId, providerId: "credential" } });

      await (akun
        ? tx.account.update({ where: { id: akun.id }, data: { password: hash } })
        : tx.account.create({ data: { id: randomUUID(), userId, accountId: userId, providerId: "credential", password: hash } }));
    }

    await tx.userModul.deleteMany({ where: { userId } });
    await tx.userModul.createMany({ data: modulValid.map((modulId) => ({ userId, modulId })) });
  });

  refresh();

  return success(id ? "Akun berhasil diperbarui." : "Akun berhasil dibuat. Bagikan username dan password-nya ke pemilik akun.");
}

export async function tambahUser(input: unknown) {
  return simpan(null, input);
}

export async function ubahUser(id: string, input: unknown) {
  return simpan(id, input);
}

export async function blokirUser(id: string, blokir: boolean): Promise<ActionResult> {
  const saya = await requireModul("users");
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });

  if (blokir && (isSuperAdmin(user.username) || user.id === saya.id)) {
    return failure("Akun admin utama dan akun Anda sendiri tidak dapat diblokir.");
  }

  await prisma.user.update({ where: { id }, data: { blokir } });

  if (blokir) {
    // Akun yang diblokir langsung keluar dari semua perangkat.
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  refresh();

  return success(blokir ? `${user.name} diblokir dan dikeluarkan dari panel.` : `${user.name} dapat login kembali.`);
}

export async function hapusUser(id: string): Promise<ActionResult> {
  const saya = await requireModul("users");
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });

  if (isSuperAdmin(user.username) || user.id === saya.id) {
    return failure("Akun admin utama dan akun Anda sendiri tidak dapat dihapus.");
  }

  await prisma.user.delete({ where: { id } });
  refresh();

  return success("Akun berhasil dihapus. Tulisannya tetap ada tanpa nama penulis.");
}
