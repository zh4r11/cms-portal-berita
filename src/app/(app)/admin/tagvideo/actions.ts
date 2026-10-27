"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { slugify } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { teks } from "@/lib/validation";

const schema = z.object({ nama: teks("Nama tag", 100), slug: z.string().trim().max(100).default("") });

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireModul("tagvideo");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const data = { nama: parsed.data.nama, slug: slugify(parsed.data.slug || parsed.data.nama) };

  try {
    await (id ? prisma.tagVideo.update({ where: { id }, data }) : prisma.tagVideo.create({ data }));
  } catch (error) {
    if (isUniqueViolation(error, "slug")) {
      return fieldErrors({ slug: "Slug sudah dipakai tag lain." });
    }

    throw error;
  }

  refresh();

  return success(pesan);
}

export async function tambahTagVideo(input: unknown) {
  return simpan(null, input, "Tag berhasil ditambahkan.");
}

export async function ubahTagVideo(id: number, input: unknown) {
  return simpan(id, input, "Tag berhasil diperbarui.");
}

export async function hapusTagVideo(id: number): Promise<ActionResult> {
  await requireModul("tagvideo");
  await prisma.tagVideo.delete({ where: { id } });
  refresh();

  return success("Tag berhasil dihapus.");
}
