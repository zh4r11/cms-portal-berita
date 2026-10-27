"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { teks } from "@/lib/validation";

const schema = z.object({
  kata: teks("Kata", 60).transform((v) => v.toLowerCase()),
  ganti: teks("Pengganti", 60),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireModul("katajelek");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  try {
    await (id
      ? prisma.kataJelek.update({ where: { id }, data: parsed.data })
      : prisma.kataJelek.create({ data: parsed.data }));
  } catch (error) {
    if (isUniqueViolation(error, "kata")) {
      return fieldErrors({ kata: "Kata ini sudah ada di daftar sensor." });
    }

    throw error;
  }

  refresh();

  return success(pesan);
}

export async function tambahKata(input: unknown) {
  return simpan(null, input, "Kata berhasil ditambahkan ke daftar sensor.");
}

export async function ubahKata(id: number, input: unknown) {
  return simpan(id, input, "Kata sensor berhasil diperbarui.");
}

export async function hapusKata(id: number): Promise<ActionResult> {
  await requireModul("katajelek");
  await prisma.kataJelek.delete({ where: { id } });
  refresh();

  return success("Kata dihapus dari daftar sensor.");
}
