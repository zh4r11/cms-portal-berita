import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatAngka, formatTanggalSingkat } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

export type KartuVideo = { id: number; judul: string; slug: string; gambar: string | null; youtube: string | null; dilihat: number; publishedAt: Date };

export function thumbnailVideo(v: Pick<KartuVideo, "gambar" | "youtube">) {
  return mediaUrl("video", v.gambar) ?? (v.youtube ? `https://i.ytimg.com/vi/${v.youtube}/mqdefault.jpg` : null);
}

export function VideoGrid({ video }: { video: KartuVideo[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {video.map((v) => {
        const thumb = thumbnailVideo(v);

        return (
          <li key={v.id}>
            <Link href={`/video/${v.slug}`} className="group block space-y-2 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring">
              <span className="relative block aspect-video overflow-hidden rounded-sm bg-muted">
                {thumb && <Image src={thumb} alt="" fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" />}
                <span className="absolute bottom-2 left-2 flex size-9 items-center justify-center rounded-full bg-black/70 text-white">
                  <Play className="size-4 fill-current" />
                </span>
              </span>
              <h3 className="font-serif leading-snug font-semibold group-hover:underline">{v.judul}</h3>
              <p className="text-xs text-muted-foreground">
                {formatTanggalSingkat(v.publishedAt)} · {formatAngka(v.dilihat)} kali ditonton
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
