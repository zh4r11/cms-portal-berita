"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { pilihan, teks } from "@/lib/validation";

const schema = z.object({
  pilihan: teks("Teks", 200),
  status: pilihan("Jenis", ["pertanyaan", "jawaban"] as const),
  aktif: z.boolean().default(true),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireModul("poling");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  await prisma.$transaction(async (tx) => {
    // Hanya satu pertanyaan yang tampil: pertanyaan lain dinonaktifkan.
    if (parsed.data.status === "pertanyaan" && parsed.data.aktif) {
      await tx.poling.updateMany({ where: { status: "pertanyaan", ...(id && { NOT: { id } }) }, data: { aktif: false } });
    }

    await (id ? tx.poling.update({ where: { id }, data: parsed.data }) : tx.poling.create({ data: parsed.data }));
  });

  refresh();

  return success(pesan);
}

export async function tambahPoling(input: unknown) {
  return simpan(null, input, "Pilihan jajak pendapat berhasil ditambahkan.");
}

export async function ubahPoling(id: number, input: unknown) {
  return simpan(id, input, "Jajak pendapat berhasil diperbarui.");
}

export async function aktifkanPoling(id: number, aktif: boolean): Promise<ActionResult> {
  await requireModul("poling");
  const row = await prisma.poling.findUniqueOrThrow({ where: { id } });

  return simpan(id, { pilihan: row.pilihan, status: row.status, aktif }, aktif ? "Ditampilkan di portal." : "Disembunyikan dari portal.");
}

export async function resetSuara(): Promise<ActionResult> {
  await requireModul("poling");
  await prisma.poling.updateMany({ data: { rating: 0 } });
  refresh();

  return success("Semua suara dikembalikan ke nol.");
}

export async function hapusPoling(id: number): Promise<ActionResult> {
  await requireModul("poling");
  await prisma.poling.delete({ where: { id } });
  refresh();

  return success("Pilihan berhasil dihapus.");
}
