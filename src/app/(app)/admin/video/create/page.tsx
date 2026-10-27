import type { Metadata } from "next";
import PageHeader, { PageContainer } from "@/components/page-header";
import { toDatetimeLocal } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { VideoForm } from "../video-form";

export const metadata: Metadata = { title: "Tambah video" };

export default async function CreateVideoPage() {
  await requireModul("video");
  const [playlist, tags] = await Promise.all([
    prisma.playlist.findMany({ orderBy: { judul: "asc" }, select: { id: true, judul: true } }),
    prisma.tagVideo.findMany({ orderBy: { nama: "asc" }, select: { nama: true } }),
  ]);

  return (
    <PageContainer breadcrumbs={[{ title: "Video", href: "/admin/video" }, { title: "Tambah video" }]}>
      <PageHeader title="Tambah video" />
      <VideoForm
        playlist={playlist}
        tags={tags.map((t) => t.nama)}
        initial={{
          playlistId: "",
          judul: "",
          slug: "",
          keterangan: "",
          youtube: "",
          tags: [],
          publishedAt: toDatetimeLocal(new Date()),
          gambar: null,
          hapusGambar: false,
          file: null,
          hapusFile: false,
        }}
      />
    </PageContainer>
  );
}
