"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";
import { teks } from "@/lib/validation";

const schema = z.object({ judul: teks("Judul", 150), file: z.unknown() });

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireModul("download");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const lama = id ? await prisma.download.findUniqueOrThrow({ where: { id } }) : null;
  const file = await prosesUpload({ file: parsed.data.file, lama: lama?.namaFile, folder: "download", jenis: "berkas", wajib: true, label: "File" });

  if ("error" in file) {
    return fieldErrors({ file: file.error });
  }

  if (id) {
    await prisma.download.update({ where: { id }, data: { judul: parsed.data.judul, ...(file.nama && { namaFile: file.nama }) } });
  } else {
    await prisma.download.create({ data: { judul: parsed.data.judul, namaFile: file.nama! } });
  }

  await file.selesai();
  refresh();

  return success(pesan);
}

export async function tambahDownload(input: unknown) {
  return simpan(null, input, "File download berhasil ditambahkan.");
}

export async function ubahDownload(id: number, input: unknown) {
  return simpan(id, input, "File download berhasil diperbarui.");
}

export async function hapusDownload(id: number): Promise<ActionResult> {
  await requireModul("download");
  const download = await prisma.download.delete({ where: { id } });
  await hapusFile("download", download.namaFile);
  refresh();

  return success("File download berhasil dihapus.");
}
