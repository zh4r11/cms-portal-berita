"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusFile } from "@/lib/storage";
import { prosesUpload } from "@/lib/upload";
import { idWajib, teks, teksOpsional } from "@/lib/validation";

const schema = z.object({
  albumId: idWajib("Album"),
  judul: teks("Judul foto", 150),
  keterangan: teksOpsional("Keterangan", 2000),
  gambar: z.unknown(),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  const user = await requireModul("galeri");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const d = parsed.data;
  const lama = id ? await prisma.galeri.findUniqueOrThrow({ where: { id } }) : null;
  const gambar = await prosesUpload({ file: d.gambar, lama: lama?.gambar, folder: "galeri", wajib: true, label: "Foto" });

  if ("error" in gambar) {
    return fieldErrors({ gambar: gambar.error });
  }

  const data = { albumId: d.albumId, judul: d.judul, keterangan: d.keterangan };

  try {
    if (id) {
      await prisma.galeri.update({ where: { id }, data: { ...data, ...(gambar.nama && { gambar: gambar.nama }) } });
    } else {
      await prisma.galeri.create({ data: { ...data, gambar: gambar.nama!, authorId: user.id } });
    }
  } catch (error) {
    await gambar.batal();
    throw error;
  }

  await gambar.selesai();
  refresh();

  return success(pesan);
}

export async function tambahFoto(input: unknown) {
  return simpan(null, input, "Foto berhasil ditambahkan.");
}

export async function ubahFoto(id: number, input: unknown) {
  return simpan(id, input, "Foto berhasil diperbarui.");
}

export async function hapusFoto(id: number): Promise<ActionResult> {
  await requireModul("galeri");
  const foto = await prisma.galeri.delete({ where: { id } });
  await hapusFile("galeri", foto.gambar);
  refresh();

  return success("Foto berhasil dihapus.");
}
