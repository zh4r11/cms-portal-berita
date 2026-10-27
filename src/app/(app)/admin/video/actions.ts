"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { slugify, slugUnik } from "@/lib/content";
import { fromDatetimeLocal } from "@/lib/dates";
import { youtubeId } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";
import { idOpsional, teks, teksOpsional } from "@/lib/validation";

const schema = z.object({
  playlistId: idOpsional(),
  judul: teks("Judul", 150),
  slug: z.string().trim().max(170).default(""),
  keterangan: teksOpsional("Keterangan", 200_000),
  youtube: z.string().trim().default(""),
  tags: z.array(z.string().trim().min(1).max(100)).max(20, "Maksimal 20 tag.").default([]),
  publishedAt: z.string().default(""),
  gambar: z.unknown(),
  hapusGambar: z.boolean().default(false),
  file: z.unknown(),
  hapusFile: z.boolean().default(false),
});

async function simpan(id: number | null, input: unknown): Promise<ActionResult> {
  const user = await requireModul("video");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const d = parsed.data;
  const lama = id ? await prisma.video.findUniqueOrThrow({ where: { id } }) : null;
  const youtube = d.youtube ? youtubeId(d.youtube) : null;
  const publishedAt = d.publishedAt ? fromDatetimeLocal(d.publishedAt) : new Date();
  const errors: Record<string, string> = {};

  if (d.youtube && !youtube) errors.youtube = "Alamat atau ID video YouTube tidak dikenali.";
  if (!publishedAt) errors.publishedAt = "Format tanggal tidak valid.";

  const adaFile = (d.file instanceof File && d.file.size > 0) || (!!lama?.file && !d.hapusFile);
  if (!youtube && !adaFile) errors.youtube = "Isi alamat YouTube atau unggah file video.";

  if (Object.keys(errors).length) {
    return fieldErrors(errors);
  }

  const gambar = await prosesUpload({ file: d.gambar, hapus: d.hapusGambar, lama: lama?.gambar, folder: "video", label: "Thumbnail" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  const file = await prosesUpload({ file: d.file, hapus: d.hapusFile, lama: lama?.file, folder: "videofile", jenis: "video", label: "File video" });

  if ("error" in file) {
    await gambar.batal();

    return fieldErrors({ file: file.error });
  }

  const slug = d.slug
    ? slugify(d.slug)
    : (lama?.slug ?? (await slugUnik(d.judul, async (s) => !!(await prisma.video.findUnique({ where: { slug: s } })))));
  const tags = [...new Map(d.tags.map((nama) => [slugify(nama), nama])).entries()];

  const data = {
    playlistId: d.playlistId,
    judul: d.judul,
    slug,
    keterangan: d.keterangan,
    youtube,
    publishedAt: publishedAt!,
    ...(gambar.nama !== undefined && { gambar: gambar.nama }),
    ...(file.nama !== undefined && { file: file.nama }),
    tags: {
      ...(id && { set: [] }),
      connectOrCreate: tags.map(([tagSlug, nama]) => ({ where: { slug: tagSlug }, create: { slug: tagSlug, nama } })),
    },
  };

  try {
    await (id ? prisma.video.update({ where: { id }, data }) : prisma.video.create({ data: { ...data, authorId: user.id } }));
  } catch (error) {
    await gambar.batal();
    await file.batal();

    if (isUniqueViolation(error, "slug")) {
      return fieldErrors({ slug: "Slug sudah dipakai video lain." });
    }

    throw error;
  }

  await gambar.selesai();
  await file.selesai();

  return success(id ? "Video berhasil diperbarui." : "Video berhasil ditambahkan.", "/admin/video");
}

export async function tambahVideo(input: unknown) {
  return simpan(null, input);
}

export async function ubahVideo(id: number, input: unknown) {
  return simpan(id, input);
}

export async function hapusVideo(id: number): Promise<ActionResult> {
  await requireModul("video");
  const video = await prisma.video.delete({ where: { id } });
  await hapusFile("video", video.gambar);
  await hapusFile("videofile", video.file);
  refresh();

  return success("Video berhasil dihapus.");
}
