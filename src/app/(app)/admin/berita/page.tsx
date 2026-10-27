import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader, { PageContainer } from "@/components/page-header";
import SearchInput from "@/components/search-input";
import { Button } from "@/components/ui/button";
import type { Prisma } from "@/generated/prisma/client";
import { mediaUrl } from "@/lib/media";
import { paginate, param, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { BeritaFilter } from "./berita-filter";
import { BeritaTable } from "./berita-table";

export const metadata: Metadata = { title: "Berita" };

export default async function BeritaPage({ searchParams }: PageProps<"/admin/berita">) {
  const user = await requireModul("berita");
  const query = await searchParams;
  const cari = param(query.cari);
  const status = param(query.status);
  const kategori = Number(param(query.kategori)) || null;

  const where: Prisma.BeritaWhereInput = {
    // Level user hanya melihat berita tulisannya sendiri.
    ...(user.level !== "admin" && { authorId: user.id }),
    ...(cari && { judul: { contains: cari, mode: "insensitive" } }),
    ...(status === "terbit" && { aktif: true }),
    ...(status === "draf" && { aktif: false }),
    ...(kategori && { kategoriId: kategori }),
  };

  const [total, daftarKategori] = await Promise.all([
    prisma.berita.count({ where }),
    prisma.kategori.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ]);
  const page = paginate(parsePage(query.page), total);
  const rows = await prisma.berita.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: {
      id: true,
      judul: true,
      slug: true,
      gambar: true,
      aktif: true,
      headline: true,
      utama: true,
      dibaca: true,
      publishedAt: true,
      kategori: { select: { nama: true } },
      author: { select: { name: true } },
      _count: { select: { komentar: true } },
    },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Berita" }]}>
      <PageHeader
        title="Berita"
        description={user.level === "admin" ? "Semua berita dari seluruh penulis." : "Berita yang Anda tulis."}
      >
        <Button asChild>
          <Link href="/admin/berita/create">
            <Plus />
            Tulis berita
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SearchInput value={cari} placeholder="Cari judul berita..." />
        <BeritaFilter status={status} kategori={kategori ? String(kategori) : ""} daftarKategori={daftarKategori} />
      </div>

      <BeritaTable
        rows={rows.map((b) => ({ ...b, gambarUrl: mediaUrl("berita", b.gambar) }))}
        meta={page.meta(rows.length)}
        filtered={!!(cari || status || kategori)}
      />
    </PageContainer>
  );
}
