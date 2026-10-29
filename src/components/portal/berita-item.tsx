import Image from "next/image";
import Link from "next/link";
import { gayaKategori } from "@/lib/cms";
import { ringkas } from "@/lib/content";
import { formatTanggal } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import type { KartuBerita } from "@/lib/portal";
import { cn } from "@/lib/utils";

/** Baris daftar berita: foto kecil di kiri, judul serif, kutipan pendek. */
export function BeritaItem({ berita, priority = false }: { berita: KartuBerita; priority?: boolean }) {
  const foto = mediaUrl("berita", berita.gambar);

  return (
    <article className="grid grid-cols-[6.5rem_1fr] gap-4 sm:grid-cols-[11rem_1fr]">
      <Link href={`/berita/${berita.slug}`} tabIndex={-1} aria-hidden className={cn(!foto && "invisible")}>
        {foto && (
          <Image
            src={foto}
            alt=""
            width={352}
            height={240}
            priority={priority}
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        )}
      </Link>
      <div className="min-w-0 space-y-1.5">
        <Meta berita={berita} />
        <h3 className="font-serif text-lg leading-snug font-semibold sm:text-xl">
          <Link href={`/berita/${berita.slug}`} className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring">
            {berita.judul}
          </Link>
        </h3>
        <p className="hidden text-sm text-muted-foreground sm:line-clamp-2">{ringkas(berita.isi)}</p>
      </div>
    </article>
  );
}

export function Meta({ berita }: { berita: Pick<KartuBerita, "kategori" | "publishedAt"> }) {
  return (
    <p className="text-xs text-muted-foreground">
      {berita.kategori && (
        <>
          <Link
            href={`/kategori/${berita.kategori.slug}`}
            className="kat font-semibold text-(--kat) uppercase hover:underline"
            style={gayaKategori(berita.kategori.warna)}
          >
            {berita.kategori.nama}
          </Link>
          {" · "}
        </>
      )}
      <time dateTime={berita.publishedAt.toISOString()}>{formatTanggal(berita.publishedAt)}</time>
    </p>
  );
}
