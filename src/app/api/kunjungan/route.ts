import { headers } from "next/headers";
import { hariIni, toDbDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

/**
 * Catat kunjungan halaman portal ke tabel statistik: satu baris per IP per
 * hari, `hits` bertambah setiap halaman dibuka (sama seperti versi lama).
 */
export async function POST() {
  const list = await headers();
  const ip = (list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "127.0.0.1").slice(0, 45);
  const tanggal = toDbDate(hariIni());

  await prisma.statistik.upsert({
    where: { ip_tanggal: { ip, tanggal } },
    update: { hits: { increment: 1 }, online: new Date() },
    create: { ip, tanggal },
  });

  return new Response(null, { status: 204 });
}
