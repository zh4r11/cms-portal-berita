"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";

const schema = z.object({ alamat: z.string().max(5000, "Alamat maksimal 5000 karakter.") });

/** Tabel mod_alamat hanya dipakai satu baris. */
export async function simpanAlamat(input: unknown): Promise<ActionResult> {
  await requireModul("alamat");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const lama = await prisma.modAlamat.findFirst({ orderBy: { id: "asc" } });

  if (!parsed.data.alamat.trim()) {
    await prisma.modAlamat.deleteMany();
  } else if (lama) {
    await prisma.modAlamat.update({ where: { id: lama.id }, data: parsed.data });
  } else {
    await prisma.modAlamat.create({ data: parsed.data });
  }

  refresh();

  return success("Alamat kontak berhasil disimpan.");
}
