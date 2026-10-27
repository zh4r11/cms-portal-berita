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
  aktif: z.boolean().default(true),
  gambar: z.unknown(),
  hapusGambar: z.boolean().default(false),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  const user = await requireModul("playlist");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const d = parsed.data;
  const lama = id ? await prisma.playlist.findUniqueOrThrow({ where: { id } }) : null;
  const slug = d.slug
    ? slugify(d.slug)
    : (lama?.slug ?? (await slugUnik(d.judul, async (s) => !!(await prisma.playlist.findUnique({ where: { slug: s } })))));
  const gambar = await prosesUpload({ file: d.gambar, hapus: d.hapusGambar, lama: lama?.gambar, folder: "playlist", label: "Sampul" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  const data = { judul: d.judul, slug, aktif: d.aktif, ...(gambar.nama !== undefined && { gambar: gambar.nama }) };

  try {
    await (id ? prisma.playlist.update({ where: { id }, data }) : prisma.playlist.create({ data: { ...data, authorId: user.id } }));
  } catch (error) {
    await gambar.batal();

    if (isUniqueViolation(error, "slug")) {
      return fieldErrors({ slug: "Slug sudah dipakai playlist lain." });
    }

    throw error;
  }

  await gambar.selesai();
  refresh();

  return success(pesan);
}

export async function tambahPlaylist(input: unknown) {
  return simpan(null, input, "Playlist berhasil ditambahkan.");
}

export async function ubahPlaylist(id: number, input: unknown) {
  return simpan(id, input, "Playlist berhasil diperbarui.");
}

export async function aktifkanPlaylist(id: number, aktif: boolean): Promise<ActionResult> {
  await requireModul("playlist");
  await prisma.playlist.update({ where: { id }, data: { aktif } });
  refresh();

  return success(aktif ? "Playlist ditampilkan di portal." : "Playlist disembunyikan.");
}

export async function hapusPlaylist(id: number): Promise<ActionResult> {
  await requireModul("playlist");
  const playlist = await prisma.playlist.delete({ where: { id } });
  await hapusFile("playlist", playlist.gambar);
  refresh();

  return success("Playlist dihapus. Video di dalamnya tetap ada tanpa playlist.");
}
