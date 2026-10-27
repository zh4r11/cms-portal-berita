"use server";

import { forbidden } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { slugify, slugUnik } from "@/lib/content";
import { fromDatetimeLocal } from "@/lib/dates";
import { youtubeId } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul, type CurrentUser } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";
import { idOpsional, teks, teksOpsional } from "@/lib/validation";

const schema = z.object({
  judul: teks("Judul", 200),
  subJudul: teksOpsional("Sub judul", 200),
  slug: z.string().trim().max(200).default(""),
  kategoriId: idOpsional(),
  isi: teks("Isi berita", 200_000),
  youtube: z.string().trim().default(""),
  keteranganGambar: teksOpsional("Keterangan gambar", 500),
  tags: z.array(z.string().trim().min(1).max(100)).max(20, "Maksimal 20 tag.").default([]),
  headline: z.boolean().default(false),
  utama: z.boolean().default(false),
  aktif: z.boolean().default(false),
  publishedAt: z.string().default(""),
  gambar: z.unknown(),
  hapusGambar: z.boolean().default(false),
});

/** Level user hanya boleh mengubah berita tulisannya sendiri (seperti versi lama). */
async function beritaMilik(user: CurrentUser, id: number) {
  const berita = await prisma.berita.findUniqueOrThrow({ where: { id } });

  if (user.level !== "admin" && berita.authorId !== user.id) {
    forbidden();
  }

  return berita;
}

async function simpan(id: number | null, input: unknown): Promise<ActionResult> {
  const user = await requireModul("berita");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const data = parsed.data;
  const lama = id ? await beritaMilik(user, id) : null;
  const errors: Record<string, string> = {};
  const youtube = data.youtube ? youtubeId(data.youtube) : null;
  const publishedAt = data.publishedAt ? fromDatetimeLocal(data.publishedAt) : new Date();

  if (data.youtube && !youtube) errors.youtube = "Alamat atau ID video YouTube tidak dikenali.";
  if (!publishedAt) errors.publishedAt = "Format tanggal terbit tidak valid.";

  if (Object.keys(errors).length) {
    return fieldErrors(errors);
  }

  const slug = data.slug
    ? slugify(data.slug)
    : (lama?.slug ?? (await slugUnik(data.judul, async (s) => !!(await prisma.berita.findUnique({ where: { slug: s } })))));

  const gambar = await prosesUpload({ file: data.gambar, hapus: data.hapusGambar, lama: lama?.gambar, folder: "berita" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  const tags = [...new Map(data.tags.map((nama) => [slugify(nama), nama])).entries()];
  const values = {
    judul: data.judul,
    subJudul: data.subJudul,
    slug,
    kategoriId: data.kategoriId,
    isi: data.isi,
    youtube,
    keteranganGambar: data.keteranganGambar,
    headline: data.headline,
    utama: data.utama,
    aktif: data.aktif,
    publishedAt: publishedAt!,
    ...(gambar.nama !== undefined && { gambar: gambar.nama }),
    tags: {
      ...(id && { set: [] }),
      connectOrCreate: tags.map(([tagSlug, nama]) => ({ where: { slug: tagSlug }, create: { slug: tagSlug, nama } })),
    },
  };

  try {
    if (id) {
      await prisma.berita.update({ where: { id }, data: values });
    } else {
      await prisma.berita.create({ data: { ...values, authorId: user.id } });
    }
  } catch (error) {
    await gambar.batal();

    if (isUniqueViolation(error, "slug")) {
      return fieldErrors({ slug: "Slug sudah dipakai berita lain." });
    }

    throw error;
  }

  await gambar.selesai();

  return success(id ? "Berita berhasil diperbarui." : "Berita berhasil disimpan.", "/admin/berita");
}

export async function tambahBerita(input: unknown) {
  return simpan(null, input);
}

export async function ubahBerita(id: number, input: unknown) {
  return simpan(id, input);
}

export async function terbitkanBerita(id: number, aktif: boolean): Promise<ActionResult> {
  const user = await requireModul("berita");
  await beritaMilik(user, id);
  await prisma.berita.update({ where: { id }, data: { aktif } });
  refresh();

  return success(aktif ? "Berita diterbitkan." : "Berita dikembalikan menjadi draf.");
}

export async function hapusBerita(id: number): Promise<ActionResult> {
  const user = await requireModul("berita");
  const berita = await beritaMilik(user, id);
  await prisma.berita.delete({ where: { id } });
  await hapusFile("berita", berita.gambar);
  refresh();

  return success("Berita berhasil dihapus.");
}
