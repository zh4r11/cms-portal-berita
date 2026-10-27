"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { slugify, slugUnik } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";
import { teks, teksOpsional } from "@/lib/validation";

const schema = z.object({
  judul: teks("Judul", 150),
  slug: z.string().trim().max(170).default(""),
  keterangan: teksOpsional("Keterangan", 2000),
  aktif: z.boolean().default(true),
  gambar: z.unknown(),
  hapusGambar: z.boolean().default(false),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  const user = await requireModul("album");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const d = parsed.data;
  const lama = id ? await prisma.album.findUniqueOrThrow({ where: { id } }) : null;
  const slug = d.slug
    ? slugify(d.slug)
    : (lama?.slug ?? (await slugUnik(d.judul, async (s) => !!(await prisma.album.findUnique({ where: { slug: s } })))));
  const gambar = await prosesUpload({ file: d.gambar, hapus: d.hapusGambar, lama: lama?.gambar, folder: "album", label: "Sampul" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  const data = { judul: d.judul, slug, keterangan: d.keterangan, aktif: d.aktif, ...(gambar.nama !== undefined && { gambar: gambar.nama }) };

  try {
    await (id ? prisma.album.update({ where: { id }, data }) : prisma.album.create({ data: { ...data, authorId: user.id } }));
  } catch (error) {
    await gambar.batal();

    if (isUniqueViolation(error, "slug")) {
      return fieldErrors({ slug: "Slug sudah dipakai album lain." });
    }

    throw error;
  }

  await gambar.selesai();
  refresh();

  return success(pesan);
}

export async function tambahAlbum(input: unknown) {
  return simpan(null, input, "Album berhasil ditambahkan.");
}

export async function ubahAlbum(id: number, input: unknown) {
  return simpan(id, input, "Album berhasil diperbarui.");
}

export async function aktifkanAlbum(id: number, aktif: boolean): Promise<ActionResult> {
  await requireModul("album");
  await prisma.album.update({ where: { id }, data: { aktif } });
  refresh();

  return success(aktif ? "Album ditampilkan di portal." : "Album disembunyikan.");
}

export async function hapusAlbum(id: number): Promise<ActionResult> {
  await requireModul("album");
  const foto = await prisma.galeri.findMany({ where: { albumId: id }, select: { gambar: true } });
  const album = await prisma.album.delete({ where: { id } });
  await hapusFile("album", album.gambar);
  await Promise.all(foto.map((f) => hapusFile("galeri", f.gambar)));
  refresh();

  return success("Album dan seluruh fotonya berhasil dihapus.");
}
