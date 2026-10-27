import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient, type Level } from "../src/generated/prisma/client";
import { MODUL, MODUL_ADMIN, MODUL_KEYS } from "../src/lib/modul";

const max = Number(process.env.DATABASE_POOL_MAX) || undefined;

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, ...(max && { max }) }),
});

/** Baris modul untuk setiap kunci di src/lib/modul.ts (yang sudah ada tidak diubah). */
export async function pastikanModul() {
  for (const [urutan, link] of MODUL_KEYS.entries()) {
    await prisma.modul.upsert({
      where: { link },
      update: {},
      create: {
        link,
        nama: MODUL[link].nama,
        urutan: urutan + 1,
        status: MODUL_ADMIN.includes(link) ? "admin" : "user",
      },
    });
  }
}

/** Tiga skema warna, padanan folder layout/merah, biru, hijau. */
export async function pastikanTemplate() {
  if ((await prisma.template.count()) > 0) {
    return;
  }

  await prisma.template.createMany({
    data: [
      { judul: "Merah", folder: "merah", aktif: true },
      { judul: "Biru", folder: "biru" },
      { judul: "Hijau", folder: "hijau" },
    ],
  });
}

/**
 * Buat atau perbarui akun beserta password-nya, dengan susunan tabel yang
 * sama seperti yang dibuat Better Auth (provider "credential").
 * `passwordHash` dipakai apa adanya (hash MD5 dari CMS lama).
 */
export async function simpanAkun(input: {
  username: string;
  name: string;
  email: string;
  level: Level;
  blokir?: boolean;
  noTelp?: string | null;
  image?: string | null;
  password?: string;
  passwordHash?: string;
}): Promise<string> {
  const username = input.username.toLowerCase();
  const hash = input.passwordHash ?? (await hashPassword(input.password ?? randomUUID()));
  const data = {
    name: input.name,
    email: input.email.toLowerCase(),
    displayUsername: input.username,
    level: input.level,
    blokir: input.blokir ?? false,
    noTelp: input.noTelp || null,
    image: input.image ?? null,
  };

  const user = await prisma.user.upsert({
    where: { username },
    update: data,
    create: { id: randomUUID(), username, emailVerified: true, ...data },
  });

  const account = await prisma.account.findFirst({ where: { userId: user.id, providerId: "credential" } });

  if (account) {
    await prisma.account.update({ where: { id: account.id }, data: { password: hash } });
  } else {
    await prisma.account.create({
      data: { id: randomUUID(), userId: user.id, accountId: user.id, providerId: "credential", password: hash },
    });
  }

  return user.id;
}
