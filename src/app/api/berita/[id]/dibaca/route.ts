import { prisma } from "@/lib/prisma";

/**
 * Tambah hitungan baca satu berita. Dipanggil dari browser setelah halaman
 * tampil, jadi prefetch tautan dan render ulang tidak ikut terhitung. Memakai
 * SQL langsung agar updated_at tidak ikut berubah.
 */
export async function POST(_request: Request, { params }: RouteContext<"/api/berita/[id]/dibaca">) {
  const id = Number((await params).id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return new Response(null, { status: 404 });
  }

  await prisma.$executeRaw`UPDATE berita SET dibaca = dibaca + 1 WHERE id = ${id} AND aktif AND published_at <= now()`;

  return new Response(null, { status: 204 });
}
