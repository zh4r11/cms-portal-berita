"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { prosesUpload } from "@/lib/upload";
import { teks, teksOpsional } from "@/lib/validation";

const urlOpsional = (label: string) =>
  teksOpsional(label, 200).refine((v) => !v || /^https?:\/\//.test(v), `${label} harus diawali http:// atau https://.`);

const schema = z.object({
  namaWebsite: teks("Nama website", 150),
  email: teksOpsional("Email", 150).refine((v) => !v || z.email().safeParse(v).success, "Format email tidak valid."),
  url: urlOpsional("Alamat website"),
  facebook: urlOpsional("Halaman Facebook"),
  rekening: teksOpsional("Rekening", 200),
  noTelp: teksOpsional("No. telepon", 30),
  metaDeskripsi: teksOpsional("Deskripsi", 250),
  metaKeyword: teksOpsional("Kata kunci", 250),
  favicon: z.unknown(),
  hapusFavicon: z.boolean().default(false),
});

export async function simpanIdentitas(input: unknown): Promise<ActionResult> {
  await requireModul("identitas");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const { favicon: file, hapusFavicon, ...data } = parsed.data;
  const lama = await prisma.identitas.findUnique({ where: { id: 1 } });
  const favicon = await prosesUpload({ file, hapus: hapusFavicon, lama: lama?.favicon, folder: "favicon", label: "Favicon" });

  if ("error" in favicon) {
    return fieldErrors({ favicon: favicon.error });
  }

  const values = { ...data, ...(favicon.nama !== undefined && { favicon: favicon.nama }) };
  await prisma.identitas.upsert({ where: { id: 1 }, update: values, create: { id: 1, ...values } });
  await favicon.selesai();
  refresh();

  return success("Identitas website berhasil disimpan.");
}
