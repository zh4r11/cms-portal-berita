"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";
import { teks } from "@/lib/validation";

const schema = z.object({
  info: teks("Info", 200),
  aktif: z.boolean().default(true),
  gambar: z.unknown(),
  hapusGambar: z.boolean().default(false),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireModul("sekilasinfo");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const lama = id ? await prisma.sekilasInfo.findUniqueOrThrow({ where: { id } }) : null;
  const gambar = await prosesUpload({ file: parsed.data.gambar, hapus: parsed.data.hapusGambar, lama: lama?.gambar, folder: "sekilasinfo" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  const data = { info: parsed.data.info, aktif: parsed.data.aktif, ...(gambar.nama !== undefined && { gambar: gambar.nama }) };
  await (id ? prisma.sekilasInfo.update({ where: { id }, data }) : prisma.sekilasInfo.create({ data }));
  await gambar.selesai();
  refresh();

  return success(pesan);
}

export async function tambahInfo(input: unknown) {
  return simpan(null, input, "Sekilas info berhasil ditambahkan.");
}

export async function ubahInfo(id: number, input: unknown) {
  return simpan(id, input, "Sekilas info berhasil diperbarui.");
}

export async function aktifkanInfo(id: number, aktif: boolean): Promise<ActionResult> {
  await requireModul("sekilasinfo");
  await prisma.sekilasInfo.update({ where: { id }, data: { aktif } });
  refresh();

  return success(aktif ? "Info ditampilkan di portal." : "Info disembunyikan.");
}

export async function hapusInfo(id: number): Promise<ActionResult> {
  await requireModul("sekilasinfo");
  const info = await prisma.sekilasInfo.delete({ where: { id } });
  await hapusFile("sekilasinfo", info.gambar);
  refresh();

  return success("Sekilas info berhasil dihapus.");
}
