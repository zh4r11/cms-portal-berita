"use server";

import { notFound } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";
import { teks } from "@/lib/validation";
import { isJenisIklan, modelIklan, type JenisIklan } from "./jenis";

const schema = z.object({
  judul: teks("Judul", 150),
  url: z
    .string()
    .trim()
    .max(200)
    .refine((v) => !v || /^https?:\/\//.test(v) || v.startsWith("/"), "Alamat harus diawali http://, https://, atau /.")
    .transform((v) => v || null),
  gambar: z.unknown(),
});

async function cek(jenis: string): Promise<JenisIklan> {
  if (!isJenisIklan(jenis)) {
    notFound();
  }

  await requireModul(jenis);

  return jenis;
}

async function simpan(jenisInput: string, id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  const jenis = await cek(jenisInput);
  const model = modelIklan(jenis);
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const lama = id ? await model.findUniqueOrThrow({ where: { id } }) : null;
  const gambar = await prosesUpload({ file: parsed.data.gambar, lama: lama?.gambar, folder: jenis, wajib: true });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  const data = { judul: parsed.data.judul, url: parsed.data.url };

  if (id) {
    await model.update({ where: { id }, data: { ...data, ...(gambar.nama && { gambar: gambar.nama }) } });
  } else {
    await model.create({ data: { ...data, gambar: gambar.nama! } });
  }

  await gambar.selesai();
  refresh();

  return success(pesan);
}

export async function tambahIklan(jenis: string, input: unknown) {
  return simpan(jenis, null, input, "Berhasil ditambahkan.");
}

export async function ubahIklan(jenis: string, id: number, input: unknown) {
  return simpan(jenis, id, input, "Berhasil diperbarui.");
}

export async function hapusIklan(jenisInput: string, id: number): Promise<ActionResult> {
  const jenis = await cek(jenisInput);
  const row = await modelIklan(jenis).delete({ where: { id } });
  await hapusFile(jenis, row.gambar);
  refresh();

  return success("Berhasil dihapus.");
}
