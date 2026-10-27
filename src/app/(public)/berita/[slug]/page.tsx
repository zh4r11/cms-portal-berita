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
import { Badge } from "@/components/ui/badge";
import { bersihkanHtml, ringkas } from "@/lib/content";
import { formatAngka } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { beritaTerbit } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { kirimKomentar } from "../../actions";

const getBerita = cache(async (slug: string) =>
  prisma.berita.findFirst({
    where: { AND: [beritaTerbit(), { slug }] },
    include: {
      kategori: { select: { id: true, nama: true, slug: true } },
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

  return {
    title: berita.judul,
    description: berita.subJudul ?? ringkas(berita.isi, 160),
    openGraph: { type: "article", title: berita.judul, publishedTime: berita.publishedAt.toISOString(), images: foto ? [foto] : undefined },
  };
}

export default async function BeritaPage({ params }: PageProps<"/berita/[slug]">) {
  const berita = await getBerita((await params).slug);

  if (!berita) {
    notFound();
  }

  const [, terkait, kataJelek] = await Promise.all([
    prisma.berita.update({ where: { id: berita.id }, data: { dibaca: { increment: 1 } }, select: { id: true } }),
    berita.kategoriId
      ? prisma.berita.findMany({
          where: { AND: [beritaTerbit(), { kategoriId: berita.kategoriId, NOT: { id: berita.id } }] },
          orderBy: { publishedAt: "desc" },
          take: 5,
          select: { id: true, judul: true, slug: true },
        })
      : [],
    prisma.kataJelek.findMany({ select: { kata: true, ganti: true } }),
  ]);
  const foto = mediaUrl("berita", berita.gambar);
  const kirim = kirimKomentar.bind(null, berita.id);

  return (
    <DenganSidebar>
      <article className="mx-auto max-w-2xl">
        <header className="space-y-3">
          <Meta berita={berita} />
          <h1 className="font-serif text-3xl leading-tight font-bold text-balance sm:text-4xl">{berita.judul}</h1>
          {berita.subJudul && <p className="text-lg text-muted-foreground">{berita.subJudul}</p>}
          <p className="text-sm text-muted-foreground">
            {berita.author ? `Oleh ${berita.author.name} · ` : ""}
            {formatAngka(berita.dibaca + 1)} kali dibaca
          </p>
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

        {berita.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tag">
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
            <JudulBagian id="terkait" href={`/kategori/${berita.kategori.slug}`} hrefLabel={`Semua ${berita.kategori.nama}`}>
              Berita Terkait
            </JudulBagian>
            <ul className="grid gap-2">
              {terkait.map((b) => (
                <li key={b.id}>
                  <Link href={`/berita/${b.slug}`} className="font-serif hover:underline">
                    {b.judul}
                  </Link>
                </li>
              ))}
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
