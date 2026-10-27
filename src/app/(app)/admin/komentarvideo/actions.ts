"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { teks, teksOpsional } from "@/lib/validation";

const schema = z.object({
  nama: teks("Nama", 100),
  url: teksOpsional("Situs web", 200),
  isi: teks("Komentar", 2000),
});

export async function ubahKomentarVideo(id: number, input: unknown): Promise<ActionResult> {
  await requireModul("komentarvideo");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  await prisma.komentarVideo.update({ where: { id }, data: parsed.data });
  refresh();

  return success("Komentar berhasil diperbarui.");
}

export async function aktifkanKomentarVideo(id: number, aktif: boolean): Promise<ActionResult> {
  await requireModul("komentarvideo");
  await prisma.komentarVideo.update({ where: { id }, data: { aktif } });
  refresh();

  return success(aktif ? "Komentar ditampilkan." : "Komentar disembunyikan.");
}

export async function hapusKomentarVideo(id: number): Promise<ActionResult> {
  await requireModul("komentarvideo");
  await prisma.komentarVideo.delete({ where: { id } });
  refresh();

  return success("Komentar berhasil dihapus.");
}
