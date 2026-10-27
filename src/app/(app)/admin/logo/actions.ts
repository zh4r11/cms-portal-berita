"use server";

import { refresh } from "next/cache";
import { fieldErrors, success, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";

/** Tabel logo hanya dipakai satu baris (yang terbaru). */
export async function simpanLogo(input: { gambar: unknown }): Promise<ActionResult> {
  await requireModul("logo");
  const lama = await prisma.logo.findFirst({ orderBy: { id: "desc" } });
  const gambar = await prosesUpload({ file: input.gambar, lama: lama?.gambar, folder: "logo", wajib: true, label: "Logo" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  await (lama
    ? prisma.logo.update({ where: { id: lama.id }, data: { gambar: gambar.nama! } })
    : prisma.logo.create({ data: { gambar: gambar.nama! } }));
  await gambar.selesai();
  refresh();

  return success("Logo berhasil diganti.");
}

export async function hapusLogo(): Promise<ActionResult> {
  await requireModul("logo");
  const semua = await prisma.logo.findMany();
  await prisma.logo.deleteMany();
  await Promise.all(semua.map((l) => hapusFile("logo", l.gambar)));
  refresh();

  return success("Logo dihapus. Portal menampilkan nama situs sebagai teks.");
}
