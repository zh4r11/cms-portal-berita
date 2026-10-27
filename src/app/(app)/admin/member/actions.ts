"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { emailSchema, teks, usernameSchema } from "@/lib/validation";

const schema = z.object({
  nama: teks("Nama", 100),
  email: emailSchema,
  username: usernameSchema,
  password: z.string().default(""),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireModul("member");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const { password, ...data } = parsed.data;

  if ((!id || password) && password.length < 8) {
    return fieldErrors({ password: "Password minimal 8 karakter." });
  }

  const hash = password ? await hashPassword(password) : undefined;

  try {
    if (id) {
      await prisma.member.update({ where: { id }, data: { ...data, ...(hash && { password: hash }) } });
    } else {
      await prisma.member.create({ data: { ...data, password: hash! } });
    }
  } catch (error) {
    if (isUniqueViolation(error, "email")) return fieldErrors({ email: "Email sudah terdaftar." });
    if (isUniqueViolation(error, "username")) return fieldErrors({ username: "Username sudah dipakai." });

    throw error;
  }

  refresh();

  return success(pesan);
}

export async function tambahMember(input: unknown) {
  return simpan(null, input, "Member berhasil ditambahkan.");
}

export async function ubahMember(id: number, input: unknown) {
  return simpan(id, input, "Member berhasil diperbarui.");
}

export async function hapusMember(id: number): Promise<ActionResult> {
  await requireModul("member");
  await prisma.member.delete({ where: { id } });
  refresh();

  return success("Member berhasil dihapus.");
}
