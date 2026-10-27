"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { teks } from "@/lib/validation";

const schema = z.object({ nama: teks("Nama", 100), username: teks("ID Yahoo!", 50) });

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireModul("ym");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  await (id ? prisma.modYm.update({ where: { id }, data: parsed.data }) : prisma.modYm.create({ data: parsed.data }));
  refresh();

  return success(pesan);
}

export async function tambahYm(input: unknown) {
  return simpan(null, input, "Kontak berhasil ditambahkan.");
}

export async function ubahYm(id: number, input: unknown) {
  return simpan(id, input, "Kontak berhasil diperbarui.");
}

export async function hapusYm(id: number): Promise<ActionResult> {
  await requireModul("ym");
  await prisma.modYm.delete({ where: { id } });
  refresh();

  return success("Kontak berhasil dihapus.");
}
