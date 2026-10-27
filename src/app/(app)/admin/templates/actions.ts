"use server";

import { refresh } from "next/cache";
import { success, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";

/** Hanya satu template yang aktif, seperti tabel templates versi lama. */
export async function aktifkanTemplate(id: number): Promise<ActionResult> {
  await requireModul("templates");
  await prisma.$transaction([
    prisma.template.updateMany({ data: { aktif: false } }),
    prisma.template.update({ where: { id }, data: { aktif: true } }),
  ]);
  refresh();

  return success("Template warna diganti. Portal dan panel memakai warna baru.");
}
