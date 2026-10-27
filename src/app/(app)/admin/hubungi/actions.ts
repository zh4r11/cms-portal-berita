"use server";

import { refresh } from "next/cache";
import { success, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";

export async function tandaiPesan(id: number, dibaca: boolean): Promise<ActionResult> {
  await requireModul("hubungi");
  await prisma.hubungi.update({ where: { id }, data: { dibaca } });
  refresh();

  return success();
}

export async function hapusPesan(id: number): Promise<ActionResult> {
  await requireModul("hubungi");
  await prisma.hubungi.delete({ where: { id } });
  refresh();

  return success("Pesan berhasil dihapus.");
}
