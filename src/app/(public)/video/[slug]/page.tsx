import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DaftarKomentar } from "@/components/portal/daftar-komentar";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { KomentarForm } from "@/components/portal/komentar-form";
import { thumbnailVideo, VideoGrid } from "@/components/portal/video-grid";
import { Badge } from "@/components/ui/badge";
import { bersihkanHtml } from "@/lib/content";
import { formatAngka, formatTanggal } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { kirimKomentarVideo } from "../../actions";

const getVideo = cache(async (slug: string) =>
  prisma.video.findUnique({
    where: { slug },
    include: {
      playlist: { select: { id: true, judul: true, slug: true, aktif: true } },
      tags: { orderBy: { nama: "asc" } },
      komentar: { where: { aktif: true }, orderBy: { createdAt: "asc" } },
    },
  }),
);

export async function generateMetadata({ params }: PageProps<"/video/[slug]">): Promise<Metadata> {
  const video = await getVideo((await params).slug);

  return { title: video?.judul ?? "Video tidak ditemukan" };
}

export default async function VideoDetailPage({ params }: PageProps<"/video/[slug]">) {
  const video = await getVideo((await params).slug);

  if (!video || (video.playlist && !video.playlist.aktif)) {
    notFound();
  }

  const [, lainnya, kataJelek] = await Promise.all([
    prisma.video.update({ where: { id: video.id }, data: { dilihat: { increment: 1 } }, select: { id: true } }),
    prisma.video.findMany({
      where: { NOT: { id: video.id }, ...(video.playlistId && { playlistId: video.playlistId }) },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, judul: true, slug: true, gambar: true, youtube: true, dilihat: true, publishedAt: true },
    }),
    prisma.kataJelek.findMany({ select: { kata: true, ganti: true } }),
  ]);
  const file = mediaUrl("videofile", video.file);

  return (
    <article className="mx-auto max-w-3xl">
      <div className="aspect-video overflow-hidden rounded-sm bg-black">
        {video.youtube ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtube}`}
            title={video.judul}
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : file ? (
          <video controls preload="metadata" poster={thumbnailVideo(video) ?? undefined} className="h-full w-full">
            <source src={file} />
            Browser Anda tidak dapat memutar video ini. <a href={file}>Unduh videonya</a>.
          </video>
        ) : (
          <p className="flex h-full items-center justify-center p-6 text-center text-sm text-white">File video ini tidak tersedia lagi.</p>
        )}
      </div>

      <header className="mt-5 space-y-2">
        <p className="text-xs text-muted-foreground">
          {video.playlist && (
            <>
              <Link href={`/video/playlist/${video.playlist.slug}`} className="font-semibold text-primary uppercase hover:underline">
                {video.playlist.judul}
              </Link>
              {" · "}
            </>
          )}
          {formatTanggal(video.publishedAt)} · {formatAngka(video.dilihat + 1)} kali ditonton
        </p>
        <h1 className="font-serif text-2xl font-bold text-balance sm:text-3xl">{video.judul}</h1>
      </header>

      {video.keterangan && <div className="isi-artikel mt-4" dangerouslySetInnerHTML={{ __html: bersihkanHtml(video.keterangan) }} />}

      {video.tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tag video">
          {video.tags.map((t) => (
            <li key={t.id}>
              <Badge variant="secondary">#{t.nama}</Badge>
            </li>
          ))}
        </ul>
      )}

      {lainnya.length > 0 && (
        <section aria-labelledby="lainnya" className="mt-10">
          <JudulBagian id="lainnya">Video Lainnya</JudulBagian>
          <VideoGrid video={lainnya} />
        </section>
      )}

      <section id="komentar" aria-labelledby="judul-komentar" className="mt-10 scroll-mt-16 space-y-6">
        <JudulBagian id="judul-komentar">Komentar ({video.komentar.length})</JudulBagian>
        <DaftarKomentar komentar={video.komentar} kataJelek={kataJelek} />
        <div className="rounded-lg border p-4 sm:p-6">
          <h2 className="mb-4 font-semibold">Tulis komentar</h2>
          <KomentarForm kirim={kirimKomentarVideo.bind(null, video.id)} denganEmail={false} />
        </div>
      </section>
    </article>
  );
}
