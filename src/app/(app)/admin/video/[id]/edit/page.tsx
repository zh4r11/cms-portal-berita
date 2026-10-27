import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader, { PageContainer } from "@/components/page-header";
import { toDatetimeLocal } from "@/lib/dates";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { VideoForm } from "../../video-form";

export const metadata: Metadata = { title: "Ubah video" };

export default async function EditVideoPage({ params }: PageProps<"/admin/video/[id]/edit">) {
  await requireModul("video");
  const id = Number((await params).id);
  const video = Number.isInteger(id) ? await prisma.video.findUnique({ where: { id }, include: { tags: true } }) : null;

  if (!video) {
    notFound();
  }

  const [playlist, tags] = await Promise.all([
    prisma.playlist.findMany({ orderBy: { judul: "asc" }, select: { id: true, judul: true } }),
    prisma.tagVideo.findMany({ orderBy: { nama: "asc" }, select: { nama: true } }),
  ]);

  return (
    <PageContainer breadcrumbs={[{ title: "Video", href: "/admin/video" }, { title: "Ubah video" }]}>
      <PageHeader title="Ubah video" />
      <VideoForm
        id={video.id}
        playlist={playlist}
        tags={tags.map((t) => t.nama)}
        gambarUrl={mediaUrl("video", video.gambar)}
        namaFile={video.file}
        initial={{
          playlistId: video.playlistId ? String(video.playlistId) : "",
          judul: video.judul,
          slug: video.slug,
          keterangan: video.keterangan ?? "",
          youtube: video.youtube ?? "",
          tags: video.tags.map((t) => t.nama),
          publishedAt: toDatetimeLocal(video.publishedAt),
          gambar: null,
          hapusGambar: false,
          file: null,
          hapusFile: false,
        }}
      />
    </PageContainer>
  );
}
