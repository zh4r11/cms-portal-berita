"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { slugify, slugUnik } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";
import { teks } from "@/lib/validation";

const schema = z.object({
  judul: teks("Judul", 150),
  slug: z.string().trim().max(170).default(""),
  isi: teks("Isi halaman", 200_000),
  gambar: z.unknown(),
  hapusGambar: z.boolean().default(false),
});

async function simpan(id: number | null, input: unknown): Promise<ActionResult> {
  const user = await requireModul("halaman");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const lama = id ? await prisma.halamanStatis.findUniqueOrThrow({ where: { id } }) : null;
  const slug = parsed.data.slug
    ? slugify(parsed.data.slug)
    : (lama?.slug ?? (await slugUnik(parsed.data.judul, async (s) => !!(await prisma.halamanStatis.findUnique({ where: { slug: s } })))));
  const gambar = await prosesUpload({ file: parsed.data.gambar, hapus: parsed.data.hapusGambar, lama: lama?.gambar, folder: "halaman" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  const data = { judul: parsed.data.judul, slug, isi: parsed.data.isi, ...(gambar.nama !== undefined && { gambar: gambar.nama }) };

  try {
    await (id
      ? prisma.halamanStatis.update({ where: { id }, data })
      : prisma.halamanStatis.create({ data: { ...data, authorId: user.id } }));
  } catch (error) {
    await gambar.batal();

    if (isUniqueViolation(error, "slug")) {
      return fieldErrors({ slug: "Slug sudah dipakai halaman lain." });
    }

    throw error;
  }

  await gambar.selesai();

  return success(id ? "Halaman berhasil diperbarui." : "Halaman berhasil dibuat.", "/admin/halaman");
}

export async function tambahHalaman(input: unknown) {
  return simpan(null, input);
}

export async function ubahHalaman(id: number, input: unknown) {
  return simpan(id, input);
}

export async function hapusHalaman(id: number): Promise<ActionResult> {
  await requireModul("halaman");
  const halaman = await prisma.halamanStatis.delete({ where: { id } });
  await hapusFile("halaman", halaman.gambar);
  // Menu yang menunjuk ke halaman ini ikut dilepas agar tidak jadi tautan mati.
  await prisma.menu.updateMany({ where: { link: `/halaman/${halaman.slug}` }, data: { aktif: false } });
  refresh();

  return success("Halaman berhasil dihapus.");
}
