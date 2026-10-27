import { Clapperboard } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import Pagination from "@/components/pagination";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { VideoGrid } from "@/components/portal/video-grid";
import { Badge } from "@/components/ui/badge";
import { paginate, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Video" };

const kartu = { id: true, judul: true, slug: true, gambar: true, youtube: true, dilihat: true, publishedAt: true } as const;

export default async function VideoPage({ searchParams }: PageProps<"/video">) {
  const { page: pageParam } = await searchParams;
  const where = { OR: [{ playlistId: null }, { playlist: { aktif: true } }] };
  const [total, playlist] = await Promise.all([
    prisma.video.count({ where }),
    prisma.playlist.findMany({ where: { aktif: true, video: { some: {} } }, orderBy: { judul: "asc" }, include: { _count: { select: { video: true } } } }),
  ]);
  const page = paginate(parsePage(pageParam), total, 12);
  const video = await prisma.video.findMany({ where, orderBy: { publishedAt: "desc" }, skip: page.skip, take: page.take, select: kartu });

  return (
    <>
      <JudulBagian as="h1">Video</JudulBagian>
      {playlist.length > 0 && (
        <nav aria-label="Playlist" className="mb-8">
          <ul className="flex flex-wrap gap-2">
            {playlist.map((p) => (
              <li key={p.id}>
                <Badge asChild variant="outline" className="h-8 px-3 text-sm pointer-coarse:h-11">
                  <Link href={`/video/playlist/${p.slug}`}>
                    {p.judul} <span className="text-muted-foreground">{p._count.video}</span>
                  </Link>
                </Badge>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {video.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          <Clapperboard className="size-8" />
          <p>Belum ada video.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <VideoGrid video={video} />
          <Pagination meta={page.meta(video.length)} />
        </div>
      )}
    </>
  );
}
