import type { Metadata } from "next";
import { KomentarTable } from "@/components/komentar-table";
import PageHeader, { PageContainer } from "@/components/page-header";
import SearchInput from "@/components/search-input";
import type { Prisma } from "@/generated/prisma/client";
import { paginate, param, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { aktifkanKomentarVideo, hapusKomentarVideo, ubahKomentarVideo } from "./actions";

export const metadata: Metadata = { title: "Komentar Video" };

export default async function KomentarVideoPage({ searchParams }: PageProps<"/admin/komentarvideo">) {
  await requireModul("komentarvideo");
  const query = await searchParams;
  const cari = param(query.cari);

  const where: Prisma.KomentarVideoWhereInput = cari
    ? {
        OR: [
          { nama: { contains: cari, mode: "insensitive" } },
          { isi: { contains: cari, mode: "insensitive" } },
          { video: { judul: { contains: cari, mode: "insensitive" } } },
        ],
      }
    : {};

  const total = await prisma.komentarVideo.count({ where });
  const page = paginate(parsePage(query.page), total);
  const rows = await prisma.komentarVideo.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: page.skip,
    take: page.take,
    include: { video: { select: { judul: true, slug: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Komentar Video" }]}>
      <PageHeader title="Komentar Video" description="Komentar pembaca langsung tampil. Sembunyikan atau hapus yang melanggar aturan." />
      <SearchInput value={cari} placeholder="Cari nama, isi, atau judul video..." />
      <KomentarTable
        rows={rows.map((k) => ({ ...k, sumber: { judul: k.video.judul, href: `/video/${k.video.slug}#komentar` } }))}
        meta={page.meta(rows.length)}
        cari={cari}
        ubah={ubahKomentarVideo}
        aktifkan={aktifkanKomentarVideo}
        hapus={hapusKomentarVideo}
      />
    </PageContainer>
  );
}
