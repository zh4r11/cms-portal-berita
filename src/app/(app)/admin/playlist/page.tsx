import type { Metadata } from "next";
import { KoleksiTable } from "@/components/koleksi-table";
import { PageContainer } from "@/components/page-header";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { aktifkanPlaylist, hapusPlaylist, tambahPlaylist, ubahPlaylist } from "./actions";

export const metadata: Metadata = { title: "Playlist Video" };

export default async function PlaylistPage() {
  await requireModul("playlist");
  const playlist = await prisma.playlist.findMany({ orderBy: { judul: "asc" }, include: { _count: { select: { video: true } } } });

  return (
    <PageContainer breadcrumbs={[{ title: "Playlist Video" }]}>
      <KoleksiTable
        title="Playlist Video"
        description="Kelompok video yang tampil di halaman Video portal."
        nama="playlist"
        satuan="Video"
        publicPrefix="/video/playlist/"
        rows={playlist.map((p) => ({
          id: p.id,
          judul: p.judul,
          slug: p.slug,
          aktif: p.aktif,
          gambarUrl: mediaUrl("playlist", p.gambar),
          jumlah: p._count.video,
        }))}
        isiPrefix="/admin/video?playlist="
        tambah={tambahPlaylist}
        ubah={ubahPlaylist}
        aktifkan={aktifkanPlaylist}
        hapus={hapusPlaylist}
      />
    </PageContainer>
  );
}
