"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { failure, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { pilihan, teks } from "@/lib/validation";

const schema = z.object({
  nama: teks("Nama modul", 50),
  status: pilihan("Hak akses", ["admin", "user"] as const),
  urutan: z.coerce.number().int().min(0).max(999),
  aktif: z.boolean(),
});

/** Modul inti panel ini tidak boleh dikunci dari admin atau dinonaktifkan. */
const WAJIB = ["users", "modul"];

export async function ubahModul(id: number, input: unknown): Promise<ActionResult> {
  await requireModul("modul");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const modul = await prisma.modul.findUniqueOrThrow({ where: { id } });

  if (WAJIB.includes(modul.link) && (!parsed.data.aktif || parsed.data.status !== "admin")) {
    return failure("Modul ini wajib aktif dan khusus admin agar panel tetap bisa dikelola.");
  }

  await prisma.modul.update({ where: { id }, data: parsed.data });

  if (parsed.data.status === "admin") {
    // Modul khusus admin dicabut dari akun level user.
    await prisma.userModul.deleteMany({ where: { modulId: id } });
  }

  refresh();

  return success("Modul berhasil diperbarui.");
}
