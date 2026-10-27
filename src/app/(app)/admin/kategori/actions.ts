"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { slugify } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { teks } from "@/lib/validation";

const schema = z.object({
  nama: teks("Nama kategori", 50),
  slug: z.string().trim().max(100).optional().default(""),
  aktif: z.boolean().default(true),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  const user = await requireModul("kategori");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const { nama, aktif } = parsed.data;
  const slug = slugify(parsed.data.slug || nama);

  try {
    if (id) {
      await prisma.kategori.update({ where: { id }, data: { nama, slug, aktif } });
    } else {
      await prisma.kategori.create({ data: { nama, slug, aktif, authorId: user.id } });
    }
  } catch (error) {
    if (isUniqueViolation(error, "slug")) {
      return fieldErrors({ slug: "Slug sudah dipakai kategori lain." });
    }

    throw error;
  }

  refresh();

  return success(pesan);
}

export async function tambahKategori(input: unknown) {
  return simpan(null, input, "Kategori berhasil ditambahkan.");
}

export async function ubahKategori(id: number, input: unknown) {
  return simpan(id, input, "Kategori berhasil diperbarui.");
}

export async function aktifkanKategori(id: number, aktif: boolean): Promise<ActionResult> {
  await requireModul("kategori");
  await prisma.kategori.update({ where: { id }, data: { aktif } });
  refresh();

  return success(aktif ? "Kategori bisa dipilih saat menulis berita." : "Kategori tidak lagi ditawarkan saat menulis berita.");
}

export async function hapusKategori(id: number): Promise<ActionResult> {
  await requireModul("kategori");
  await prisma.kategori.delete({ where: { id } });
  refresh();

  return success("Kategori berhasil dihapus.");
}
