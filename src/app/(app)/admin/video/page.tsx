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
import { VideoTable } from "./video-table";

export const metadata: Metadata = { title: "Video" };

export default async function VideoPage({ searchParams }: PageProps<"/admin/video">) {
  await requireModul("video");
  const query = await searchParams;
  const cari = param(query.cari);
  const playlistId = Number(param(query.playlist)) || null;
  const where: Prisma.VideoWhereInput = {
    ...(cari && { judul: { contains: cari, mode: "insensitive" } }),
    ...(playlistId && { playlistId }),
  };

  const total = await prisma.video.count({ where });
  const page = paginate(parsePage(query.page), total);
  const video = await prisma.video.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip: page.skip,
    take: page.take,
    include: { playlist: { select: { judul: true } }, _count: { select: { komentar: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Video" }]}>
      <PageHeader title="Video" description="Video dari YouTube atau file MP4 yang diunggah.">
        <Button asChild>
          <Link href="/admin/video/create">
            <Plus />
            Tambah video
          </Link>
        </Button>
      </PageHeader>
      <SearchInput value={cari} placeholder="Cari judul video..." />
      <VideoTable
        rows={video.map((v) => ({
          id: v.id,
          judul: v.judul,
          slug: v.slug,
          playlist: v.playlist?.judul ?? null,
          sumber: v.youtube ? "YouTube" : "File MP4",
          dilihat: v.dilihat,
          komentar: v._count.komentar,
          publishedAt: v.publishedAt,
          gambarUrl: mediaUrl("video", v.gambar) ?? (v.youtube ? `https://i.ytimg.com/vi/${v.youtube}/mqdefault.jpg` : null),
        }))}
        meta={page.meta(video.length)}
        filtered={!!(cari || playlistId)}
      />
    </PageContainer>
  );
}
