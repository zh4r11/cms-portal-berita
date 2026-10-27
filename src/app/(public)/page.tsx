import Image from "next/image";
import Link from "next/link";
import { BeritaItem, Meta } from "@/components/portal/berita-item";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { Iklan } from "@/components/portal/iklan";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { ringkas } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { beritaTerbit, kartuBerita } from "@/lib/portal";
import { prisma } from "@/lib/prisma";

export default async function BerandaPage() {
  const where = beritaTerbit();
  const [headline, iklanTengah] = await Promise.all([
    prisma.berita.findMany({ where: { AND: [where, { headline: true }] }, orderBy: { publishedAt: "desc" }, take: 4, select: kartuBerita }),
    prisma.iklanTengah.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);
  const tampil = headline.map((b) => b.id);
  const [terbaru, pilihan] = await Promise.all([
    prisma.berita.findMany({ where: { AND: [where, { id: { notIn: tampil } }] }, orderBy: { publishedAt: "desc" }, take: 10, select: kartuBerita }),
    prisma.berita.findMany({ where: { AND: [where, { utama: true }] }, orderBy: { publishedAt: "desc" }, take: 4, select: kartuBerita }),
  ]);
  const [utama, ...samping] = headline;

  if (!utama && terbaru.length === 0) {
    return (
      <DenganSidebar>
        <div className="rounded-lg border border-dashed px-6 py-16 text-center">
          <h1 className="font-serif text-2xl font-semibold">Belum ada berita yang terbit</h1>
          <p className="mt-2 text-sm text-muted-foreground">Berita yang diterbitkan redaksi dari panel akan muncul di sini.</p>
        </div>
      </DenganSidebar>
    );
  }

  return (
    <DenganSidebar>
      <h1 className="sr-only">Berita terkini</h1>

      {utama && (
        <section aria-label="Berita utama" className="mb-10 grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <article className="space-y-3">
            {utama.gambar && (
              <Link href={`/berita/${utama.slug}`} tabIndex={-1} aria-hidden>
                <Image
                  src={mediaUrl("berita", utama.gambar)!}
                  alt=""
                  width={960}
                  height={600}
                  priority
                  className="aspect-[16/10] w-full rounded-sm object-cover"
                />
              </Link>
            )}
            <Meta berita={utama} />
            <h2 className="font-serif text-2xl leading-tight font-bold text-balance sm:text-3xl">
              <Link href={`/berita/${utama.slug}`} className="hover:underline">
                {utama.judul}
              </Link>
            </h2>
            <p className="text-muted-foreground">{utama.subJudul ?? ringkas(utama.isi, 220)}</p>
          </article>

          {samping.length > 0 && (
            <ul className="grid content-start divide-y">
              {samping.map((b) => (
                <li key={b.id} className="space-y-1 py-3 first:pt-0">
                  <Meta berita={b} />
                  <h3 className="font-serif text-lg leading-snug font-semibold">
                    <Link href={`/berita/${b.slug}`} className="hover:underline">
                      {b.judul}
                    </Link>
                  </h3>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {iklanTengah && (
        <Iklan
          className="mb-10"
          url={iklanTengah.url}
          judul={iklanTengah.judul}
          src={mediaUrl("iklantengah", iklanTengah.gambar)!}
          width={728}
          height={90}
        />
      )}

      <section aria-labelledby="terbaru" className="mb-10">
        <JudulBagian id="terbaru" href="/berita" hrefLabel="Indeks berita">
          Terbaru
        </JudulBagian>
        <ul className="divide-y">
          {terbaru.map((b) => (
            <li key={b.id} className="py-4 first:pt-0">
              <BeritaItem berita={b} />
            </li>
          ))}
        </ul>
      </section>

      {pilihan.length > 0 && (
        <section aria-labelledby="pilihan">
          <JudulBagian id="pilihan">Pilihan Redaksi</JudulBagian>
          <ul className="grid gap-6 sm:grid-cols-2">
            {pilihan.map((b) => (
              <li key={b.id} className="space-y-2">
                {b.gambar && (
                  <Link href={`/berita/${b.slug}`} tabIndex={-1} aria-hidden>
                    <Image src={mediaUrl("berita", b.gambar)!} alt="" width={480} height={300} className="aspect-[16/10] w-full rounded-sm object-cover" />
                  </Link>
                )}
                <Meta berita={b} />
                <h3 className="font-serif text-lg leading-snug font-semibold">
                  <Link href={`/berita/${b.slug}`} className="hover:underline">
                    {b.judul}
                  </Link>
                </h3>
              </li>
            ))}
          </ul>
        </section>
      )}
    </DenganSidebar>
  );
}
