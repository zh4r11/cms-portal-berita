import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { KategoriTable } from "./kategori-table";

export const metadata: Metadata = { title: "Kategori Berita" };

export default async function KategoriPage() {
  await requireModul("kategori");
  const kategori = await prisma.kategori.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true, slug: true, warna: true, aktif: true, _count: { select: { berita: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Kategori Berita" }]}>
      <KategoriTable kategori={kategori} />
    </PageContainer>
  );
}
