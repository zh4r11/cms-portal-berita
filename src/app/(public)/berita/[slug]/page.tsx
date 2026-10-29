import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DaftarKomentar } from "@/components/portal/daftar-komentar";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { KomentarForm } from "@/components/portal/komentar-form";
import { Meta } from "@/components/portal/berita-item";
import { Bagikan } from "@/components/portal/bagikan";
import { HitungBaca } from "@/components/portal/hitung-baca";
import { Badge } from "@/components/ui/badge";
import { bersihkanHtml, ringkas, waktuBaca } from "@/lib/content";
import { formatAngka, formatTanggal, formatWaktu } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { beritaTerbit } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { getIdentitas } from "@/lib/site";
import { getOrigin } from "@/lib/url";
import { kirimKomentar } from "../../actions";

const getBerita = cache(async (slug: string) =>
  prisma.berita.findFirst({
    where: { AND: [beritaTerbit(), { slug }] },
    include: {
      kategori: { select: { id: true, nama: true, slug: true, warna: true } },
      author: { select: { name: true } },
      tags: { orderBy: { nama: "asc" } },
      komentar: { where: { aktif: true }, orderBy: { createdAt: "asc" } },
    },
  }),
);

export async function generateMetadata({ params }: PageProps<"/berita/[slug]">): Promise<Metadata> {
  const berita = await getBerita((await params).slug);

  if (!berita) {
    return { title: "Berita tidak ditemukan" };
  }

  const foto = mediaUrl("berita", berita.gambar);
  const description = berita.subJudul ?? ringkas(berita.isi, 160);

  return {
    title: berita.judul,
    description,
    alternates: { canonical: `/berita/${berita.slug}` },
    openGraph: {
      type: "article",
      title: berita.judul,
      description,
      url: `/berita/${berita.slug}`,
      publishedTime: berita.publishedAt.toISOString(),
      modifiedTime: berita.diubahAt?.toISOString(),
      section: berita.kategori?.nama,
      tags: berita.tags.map((t) => t.nama),
      images: foto ? [foto] : undefined,
    },
    twitter: { card: foto ? "summary_large_image" : "summary", title: berita.judul, description, images: foto ? [foto] : undefined },
  };
}

export default async function BeritaPage({ params }: PageProps<"/berita/[slug]">) {
  const berita = await getBerita((await params).slug);

  if (!berita) {
    notFound();
  }

  const [terkait, kataJelek, identitas, origin] = await Promise.all([
    berita.kategoriId
      ? prisma.berita.findMany({
          where: { AND: [beritaTerbit(), { kategoriId: berita.kategoriId, NOT: { id: berita.id } }] },
          orderBy: { publishedAt: "desc" },
          take: 4,
          select: { id: true, judul: true, slug: true, gambar: true, publishedAt: true },
        })
      : [],
    prisma.kataJelek.findMany({ select: { kata: true, ganti: true } }),
    getIdentitas(),
    getOrigin(),
  ]);
  const foto = mediaUrl("berita", berita.gambar);
  const url = `${origin}/berita/${berita.slug}`;
  const kirim = kirimKomentar.bind(null, berita.id);
  const diperbarui = berita.diubahAt && berita.diubahAt > berita.publishedAt ? berita.diubahAt : null;
  // Data terstruktur untuk Google News/Discover. "<" di-escape agar judul berita tidak bisa menutup tag script.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: berita.judul,
    description: berita.subJudul ?? ringkas(berita.isi, 160),
    image: foto ? [`${origin}${foto}`] : undefined,
    datePublished: berita.publishedAt.toISOString(),
    dateModified: (diperbarui ?? berita.publishedAt).toISOString(),
    articleSection: berita.kategori?.nama,
    keywords: berita.tags.map((t) => t.nama).join(", ") || undefined,
    mainEntityOfPage: url,
    author: berita.author ? { "@type": "Person", name: berita.author.name } : { "@type": "Organization", name: identitas.namaWebsite },
    publisher: { "@type": "Organization", name: identitas.namaWebsite, url: origin },
  };

  return (
    <DenganSidebar>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <HitungBaca id={berita.id} />
      <article className="mx-auto max-w-2xl">
        <header className="space-y-4">
          <Meta berita={berita} />
          <h1 className="font-serif text-3xl leading-tight font-bold text-balance sm:text-[2.5rem]">{berita.judul}</h1>
          {berita.subJudul && <p className="font-serif text-xl leading-snug text-pretty text-muted-foreground">{berita.subJudul}</p>}
          <div className="space-y-0.5 border-t pt-3 text-sm text-muted-foreground">
            {berita.author && <p className="font-semibold text-foreground">{berita.author.name}</p>}
            <p>
              {waktuBaca(berita.isi)} menit baca · {formatAngka(berita.dibaca + 1)} kali dibaca
              {diperbarui && (
                <>
                  {" · "}Diperbarui <time dateTime={diperbarui.toISOString()}>{formatWaktu(diperbarui)}</time>
                </>
              )}
            </p>
          </div>
        </header>

        {foto && (
          <figure className="my-6 space-y-2">
            <Image src={foto} alt={berita.keteranganGambar ?? ""} width={1200} height={750} priority className="h-auto w-full rounded-sm" />
            {berita.keteranganGambar && <figcaption className="text-sm text-muted-foreground">{berita.keteranganGambar}</figcaption>}
          </figure>
        )}

        {berita.youtube && (
          <div className="my-6 aspect-video overflow-hidden rounded-sm bg-muted">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${berita.youtube}`}
              title={`Video: ${berita.judul}`}
              allow="encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}

        <div className="isi-artikel mt-6" dangerouslySetInnerHTML={{ __html: bersihkanHtml(berita.isi) }} />

        <Bagikan url={url} judul={berita.judul} className="mt-8 border-y py-4" />

        {berita.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tag">
            {berita.tags.map((t) => (
              <li key={t.id}>
                <Badge asChild variant="secondary">
                  <Link href={`/tag/${t.slug}`}>#{t.nama}</Link>
                </Badge>
              </li>
            ))}
          </ul>
        )}

        {terkait.length > 0 && berita.kategori && (
          <section aria-labelledby="terkait" className="mt-10">
            <JudulBagian
              id="terkait"
              href={`/kategori/${berita.kategori.slug}`}
              hrefLabel={`Semua ${berita.kategori.nama}`}
              warna={berita.kategori.warna}
            >
              Berita Terkait
            </JudulBagian>
            <ul className="grid gap-5 sm:grid-cols-2">
              {terkait.map((b) => {
                const gambar = mediaUrl("berita", b.gambar);
                return (
                  <li key={b.id} className="grid grid-cols-[5.5rem_1fr] items-start gap-3">
                    <Link href={`/berita/${b.slug}`} tabIndex={-1} aria-hidden className={gambar ? undefined : "invisible"}>
                      {gambar && <Image src={gambar} alt="" width={176} height={132} className="aspect-[4/3] w-full rounded-sm object-cover" />}
                    </Link>
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-serif leading-snug font-semibold">
                        <Link href={`/berita/${b.slug}`} className="hover:underline">
                          {b.judul}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        <time dateTime={b.publishedAt.toISOString()}>{formatTanggal(b.publishedAt)}</time>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section id="komentar" aria-labelledby="judul-komentar" className="mt-10 scroll-mt-16 space-y-6">
          <JudulBagian id="judul-komentar">Komentar ({berita.komentar.length})</JudulBagian>
          <DaftarKomentar komentar={berita.komentar} kataJelek={kataJelek} />
          <div className="rounded-lg border p-4 sm:p-6">
            <h3 className="mb-4 font-semibold">Tulis komentar</h3>
            <KomentarForm kirim={kirim} />
          </div>
        </section>
      </article>
    </DenganSidebar>
  );
}
