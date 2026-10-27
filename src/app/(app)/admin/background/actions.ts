"use server";

import { refresh } from "next/cache";
import { fieldErrors, success, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";

/** Tabel background hanya dipakai satu baris (yang terbaru). */
export async function simpanBackground(input: { gambar: unknown }): Promise<ActionResult> {
  await requireModul("background");
  const lama = await prisma.background.findFirst({ orderBy: { id: "desc" } });
  const gambar = await prosesUpload({ file: input.gambar, lama: lama?.gambar, folder: "background", wajib: true, label: "Background" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  await (lama
    ? prisma.background.update({ where: { id: lama.id }, data: { gambar: gambar.nama! } })
    : prisma.background.create({ data: { gambar: gambar.nama! } }));
  await gambar.selesai();
  refresh();

  return success("Background berhasil diganti.");
}

export async function hapusBackground(): Promise<ActionResult> {
  await requireModul("background");
  const semua = await prisma.background.findMany();
  await prisma.background.deleteMany();
  await Promise.all(semua.map((l) => hapusFile("background", l.gambar)));
  refresh();

  return success("Background dihapus. Portal memakai warna latar bawaan.");
}
