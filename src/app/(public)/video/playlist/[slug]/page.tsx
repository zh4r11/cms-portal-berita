import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { VideoGrid } from "@/components/portal/video-grid";
import { prisma } from "@/lib/prisma";

const getPlaylist = cache(async (slug: string) =>
  prisma.playlist.findFirst({
    where: { slug, aktif: true },
    include: {
      video: {
        orderBy: { publishedAt: "desc" },
        select: { id: true, judul: true, slug: true, gambar: true, youtube: true, dilihat: true, publishedAt: true },
      },
    },
  }),
);

export async function generateMetadata({ params }: PageProps<"/video/playlist/[slug]">): Promise<Metadata> {
  const playlist = await getPlaylist((await params).slug);

  return { title: playlist ? `Video ${playlist.judul}` : "Playlist tidak ditemukan" };
}

export default async function PlaylistPage({ params }: PageProps<"/video/playlist/[slug]">) {
  const playlist = await getPlaylist((await params).slug);

  if (!playlist) {
    notFound();
  }

  return (
    <>
      <JudulBagian as="h1" href="/video" hrefLabel="Semua video">
        {playlist.judul}
      </JudulBagian>
      {playlist.video.length === 0 ? (
        <p className="text-sm text-muted-foreground">Playlist ini belum berisi video.</p>
      ) : (
        <VideoGrid video={playlist.video} />
      )}
    </>
  );
}
