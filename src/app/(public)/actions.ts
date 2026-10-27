"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { z } from "zod";
import { failure, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema, teks, teksOpsional } from "@/lib/validation";

const COOKIE_POLING = "poling_dipilih";

/** Satu suara per browser untuk setiap pertanyaan (penanda di cookie). */
export async function pilihPoling(jawabanId: number): Promise<ActionResult> {
  const pertanyaan = await prisma.poling.findFirst({ where: { status: "pertanyaan", aktif: true } });
  const jawaban = await prisma.poling.findFirst({ where: { id: jawabanId, status: "jawaban", aktif: true } });

  if (!pertanyaan || !jawaban) {
    return failure("Jajak pendapat ini sudah ditutup.");
  }

  const store = await cookies();

  if (store.get(COOKIE_POLING)?.value === String(pertanyaan.id)) {
    return failure("Anda sudah memberikan suara untuk pertanyaan ini.");
  }

  if (!(await rateLimit("poling", 5))) {
    return failure("Terlalu banyak percobaan. Coba lagi sebentar lagi.");
  }

  await prisma.poling.update({ where: { id: jawaban.id }, data: { rating: { increment: 1 } } });
  store.set(COOKIE_POLING, String(pertanyaan.id), { maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: "lax", path: "/" });
  refresh();

  return success("Terima kasih, suara Anda sudah tercatat.");
}

const urlOpsional = teksOpsional("Situs web", 200).refine((v) => !v || /^https?:\/\//.test(v), "Situs web harus diawali http:// atau https://.");

const komentarSchema = z.object({
  nama: teks("Nama", 100),
  email: emailSchema,
  url: urlOpsional,
  isi: teks("Komentar", 2000),
  // Kolom jebakan: tersembunyi dari manusia, biasanya diisi bot.
  website: z.string().max(0).optional(),
});

export async function kirimKomentar(beritaId: number, input: unknown): Promise<ActionResult> {
  const parsed = komentarSchema.safeParse(input);

  if (!parsed.success) {
    return parsed.error.issues.some((i) => i.path[0] === "website") ? success("Komentar terkirim.") : zodErrors(parsed.error);
  }

  if (!(await rateLimit("komentar", 3))) {
    return failure("Anda baru saja berkomentar. Tunggu sebentar sebelum mengirim lagi.");
  }

  const berita = await prisma.berita.findFirst({ where: { id: beritaId, aktif: true }, select: { id: true } });

  if (!berita) {
    return failure("Berita ini tidak ditemukan.");
  }

  const { nama, email, url, isi } = parsed.data;
  await prisma.komentar.create({ data: { beritaId, nama, email, url, isi } });
  refresh();

  return success("Komentar Anda sudah tampil.");
}

const komentarVideoSchema = komentarSchema.omit({ email: true });

export async function kirimKomentarVideo(videoId: number, input: unknown): Promise<ActionResult> {
  const parsed = komentarVideoSchema.safeParse(input);

  if (!parsed.success) {
    return parsed.error.issues.some((i) => i.path[0] === "website") ? success("Komentar terkirim.") : zodErrors(parsed.error);
  }

  if (!(await rateLimit("komentarvid", 3))) {
    return failure("Anda baru saja berkomentar. Tunggu sebentar sebelum mengirim lagi.");
  }

  const video = await prisma.video.findUnique({ where: { id: videoId }, select: { id: true } });

  if (!video) {
    return failure("Video ini tidak ditemukan.");
  }

  const { nama, url, isi } = parsed.data;
  await prisma.komentarVideo.create({ data: { videoId, nama, url, isi } });
  refresh();

  return success("Komentar Anda sudah tampil.");
}

const hubungiSchema = z.object({
  nama: teks("Nama", 100),
  email: emailSchema,
  subjek: teks("Subjek", 150),
  pesan: teks("Pesan", 5000),
  website: z.string().max(0).optional(),
});

export async function kirimPesan(input: unknown): Promise<ActionResult> {
  const parsed = hubungiSchema.safeParse(input);

  if (!parsed.success) {
    return parsed.error.issues.some((i) => i.path[0] === "website") ? success("Pesan terkirim.") : zodErrors(parsed.error);
  }

  if (!(await rateLimit("hubungi", 3))) {
    return failure("Pesan Anda sebelumnya baru saja masuk. Tunggu sebentar sebelum mengirim lagi.");
  }

  const { nama, email, subjek, pesan } = parsed.data;
  await prisma.hubungi.create({ data: { nama, email, subjek, pesan } });

  return success("Pesan terkirim. Redaksi akan membalas ke email Anda.");
}
