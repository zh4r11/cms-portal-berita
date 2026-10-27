import type { Metadata } from "next";
import { KoleksiTable } from "@/components/koleksi-table";
import { PageContainer } from "@/components/page-header";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { aktifkanAlbum, hapusAlbum, tambahAlbum, ubahAlbum } from "./actions";

export const metadata: Metadata = { title: "Album Foto" };

export default async function AlbumPage() {
  await requireModul("album");
  const album = await prisma.album.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { galeri: true } } } });

  return (
    <PageContainer breadcrumbs={[{ title: "Album Foto" }]}>
      <KoleksiTable
        title="Album Foto"
        description="Berita foto: setiap album berisi foto dari modul Galeri Foto."
        nama="album"
        satuan="Foto"
        publicPrefix="/galeri/"
        denganKeterangan
        rows={album.map((a) => ({
          id: a.id,
          judul: a.judul,
          slug: a.slug,
          keterangan: a.keterangan,
          aktif: a.aktif,
          gambarUrl: mediaUrl("album", a.gambar),
          jumlah: a._count.galeri,
        }))}
        isiPrefix="/admin/galeri?album="
        tambah={tambahAlbum}
        ubah={ubahAlbum}
        aktifkan={aktifkanAlbum}
        hapus={hapusAlbum}
      />
    </PageContainer>
  );
}
