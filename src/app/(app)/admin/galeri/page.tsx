import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { mediaUrl } from "@/lib/media";
import { paginate, param, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { GaleriTable } from "./galeri-table";

export const metadata: Metadata = { title: "Galeri Foto" };

export default async function GaleriPage({ searchParams }: PageProps<"/admin/galeri">) {
  await requireModul("galeri");
  const query = await searchParams;
  const albumId = Number(param(query.album)) || null;
  const where = albumId ? { albumId } : {};

  const [total, album] = await Promise.all([
    prisma.galeri.count({ where }),
    prisma.album.findMany({ orderBy: { judul: "asc" }, select: { id: true, judul: true } }),
  ]);
  const page = paginate(parsePage(query.page), total, 20);
  const foto = await prisma.galeri.findMany({
    where,
    orderBy: { id: "desc" },
    skip: page.skip,
    take: page.take,
    include: { album: { select: { judul: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Galeri Foto" }]}>
      <GaleriTable
        foto={foto.map((f) => ({
          id: f.id,
          albumId: f.albumId,
          album: f.album.judul,
          judul: f.judul,
          keterangan: f.keterangan,
          gambarUrl: mediaUrl("galeri", f.gambar)!,
        }))}
        album={album}
        albumId={albumId ? String(albumId) : ""}
        meta={page.meta(foto.length)}
      />
    </PageContainer>
  );
}
