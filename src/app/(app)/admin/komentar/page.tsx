import type { Metadata } from "next";
import { KomentarTable } from "@/components/komentar-table";
import PageHeader, { PageContainer } from "@/components/page-header";
import SearchInput from "@/components/search-input";
import type { Prisma } from "@/generated/prisma/client";
import { paginate, param, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { aktifkanKomentar, hapusKomentar, ubahKomentar } from "./actions";

export const metadata: Metadata = { title: "Komentar Berita" };

export default async function KomentarPage({ searchParams }: PageProps<"/admin/komentar">) {
  await requireModul("komentar");
  const query = await searchParams;
  const cari = param(query.cari);

  const where: Prisma.KomentarWhereInput = cari
    ? {
        OR: [
          { nama: { contains: cari, mode: "insensitive" } },
          { isi: { contains: cari, mode: "insensitive" } },
          { berita: { judul: { contains: cari, mode: "insensitive" } } },
        ],
      }
    : {};

  const total = await prisma.komentar.count({ where });
  const page = paginate(parsePage(query.page), total);
  const rows = await prisma.komentar.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: page.skip,
    take: page.take,
    include: { berita: { select: { judul: true, slug: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Komentar Berita" }]}>
      <PageHeader title="Komentar Berita" description="Komentar pembaca langsung tampil. Sembunyikan atau hapus yang melanggar aturan." />
      <SearchInput value={cari} placeholder="Cari nama, isi, atau judul berita..." />
      <KomentarTable
        rows={rows.map((k) => ({ ...k, sumber: { judul: k.berita.judul, href: `/berita/${k.berita.slug}#komentar` } }))}
        meta={page.meta(rows.length)}
        cari={cari}
        ubah={ubahKomentar}
        aktifkan={aktifkanKomentar}
        hapus={hapusKomentar}
      />
    </PageContainer>
  );
}
