"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { slugify, slugUnik } from "@/lib/content";
import { toDbDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";
import { teks } from "@/lib/validation";

const tanggal = (label: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} wajib diisi.`);

const schema = z
  .object({
    tema: teks("Tema", 150),
    slug: z.string().trim().max(170).default(""),
    isi: teks("Keterangan", 200_000),
    tempat: teks("Tempat", 150),
    pengirim: teks("Pengirim", 100),
    jam: teks("Jam", 50),
    tglMulai: tanggal("Tanggal mulai"),
    tglSelesai: tanggal("Tanggal selesai"),
    gambar: z.unknown(),
    hapusGambar: z.boolean().default(false),
  })
  .refine((d) => d.tglSelesai >= d.tglMulai, { path: ["tglSelesai"], message: "Tanggal selesai tidak boleh sebelum tanggal mulai." });

async function simpan(id: number | null, input: unknown): Promise<ActionResult> {
  const user = await requireModul("agenda");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const d = parsed.data;
  const lama = id ? await prisma.agenda.findUniqueOrThrow({ where: { id } }) : null;
  const slug = d.slug
    ? slugify(d.slug)
    : (lama?.slug ?? (await slugUnik(d.tema, async (s) => !!(await prisma.agenda.findUnique({ where: { slug: s } })))));
  const gambar = await prosesUpload({ file: d.gambar, hapus: d.hapusGambar, lama: lama?.gambar, folder: "agenda" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  const data = {
    tema: d.tema,
    slug,
    isi: d.isi,
    tempat: d.tempat,
    pengirim: d.pengirim,
    jam: d.jam,
    tglMulai: toDbDate(d.tglMulai),
    tglSelesai: toDbDate(d.tglSelesai),
    ...(gambar.nama !== undefined && { gambar: gambar.nama }),
  };

  try {
    await (id ? prisma.agenda.update({ where: { id }, data }) : prisma.agenda.create({ data: { ...data, authorId: user.id } }));
  } catch (error) {
    await gambar.batal();

    if (isUniqueViolation(error, "slug")) {
      return fieldErrors({ slug: "Slug sudah dipakai agenda lain." });
    }

    throw error;
  }

  await gambar.selesai();

  return success(id ? "Agenda berhasil diperbarui." : "Agenda berhasil ditambahkan.", "/admin/agenda");
}

export async function tambahAgenda(input: unknown) {
  return simpan(null, input);
}

export async function ubahAgenda(id: number, input: unknown) {
  return simpan(id, input);
}

export async function hapusAgenda(id: number): Promise<ActionResult> {
  await requireModul("agenda");
  const agenda = await prisma.agenda.delete({ where: { id } });
  await hapusFile("agenda", agenda.gambar);
  refresh();

  return success("Agenda berhasil dihapus.");
}
