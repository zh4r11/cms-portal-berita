import Image from "next/image";
import Link from "next/link";
import { BeritaItem, Meta } from "@/components/portal/berita-item";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { Iklan } from "@/components/portal/iklan";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { ringkas } from "@/lib/content";
import { formatTanggal } from "@/lib/format";
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
  const [terbaru, pilihan, rubrik] = await Promise.all([
    prisma.berita.findMany({ where: { AND: [where, { id: { notIn: tampil } }] }, orderBy: { publishedAt: "desc" }, take: 10, select: kartuBerita }),
    prisma.berita.findMany({ where: { AND: [where, { utama: true }] }, orderBy: { publishedAt: "desc" }, take: 4, select: kartuBerita }),
    // Blok per rubrik seperti halaman depan The Guardian, rubrik terbesar lebih dulu. Kategori nonaktif
    // tetap ikut: "aktif" hanya menentukan bisa dipilih saat menulis, bukan tampil di portal.
    prisma.kategori.findMany({
      where: { berita: { some: where } },
      orderBy: [{ berita: { _count: "desc" } }, { nama: "asc" }],
      take: 6,
      select: {
        id: true,
        nama: true,
        slug: true,
        warna: true,
        berita: { where: { AND: [where, { id: { notIn: tampil } }] }, orderBy: { publishedAt: "desc" }, take: 4, select: kartuBerita },
      },
    }),
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
            // Berita pertama di kolom samping berfoto besar agar kolom ini seimbang dengan berita utama;
            // sisanya memakai foto kecil supaya tingginya tidak melebihi kolom kiri.
            <ul className="grid content-start divide-y">
              {samping.map((b, i) => {
                const foto = mediaUrl("berita", b.gambar);
                return (
                  <li key={b.id} className="py-4 first:pt-0 last:pb-0">
                    <article className={i === 0 ? "space-y-2" : "grid grid-cols-[1fr_6rem] items-start gap-3"}>
                      {foto && (
                        <Link href={`/berita/${b.slug}`} tabIndex={-1} aria-hidden className={i === 0 ? "block" : "order-last"}>
                          <Image
                            src={foto}
                            alt=""
                            width={i === 0 ? 640 : 192}
                            height={i === 0 ? 360 : 144}
                            className={i === 0 ? "aspect-video w-full rounded-sm object-cover" : "aspect-[4/3] w-full rounded-sm object-cover"}
                          />
                        </Link>
                      )}
                      <div className="min-w-0 space-y-1">
                        <Meta berita={b} />
                        <h3 className={i === 0 ? "font-serif text-xl leading-snug font-bold" : "font-serif text-base leading-snug font-semibold"}>
                          <Link href={`/berita/${b.slug}`} className="hover:underline">
                            {b.judul}
                          </Link>
                        </h3>
                      </div>
                    </article>
                  </li>
                );
              })}
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
        <section aria-labelledby="pilihan" className="mb-10">
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

      {rubrik
        .filter((k) => k.berita.length > 0)
        .map((k) => {
          const [pertama, ...lain] = k.berita;
          const foto = mediaUrl("berita", pertama.gambar);
          return (
            <section key={k.id} aria-labelledby={`rubrik-${k.slug}`} className="mb-10 last:mb-0">
              <JudulBagian id={`rubrik-${k.slug}`} href={`/kategori/${k.slug}`} hrefLabel={`Semua ${k.nama}`} warna={k.warna}>
                {k.nama}
              </JudulBagian>
              <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <article className="space-y-2">
                  {foto && (
                    <Link href={`/berita/${pertama.slug}`} tabIndex={-1} aria-hidden className="block">
                      <Image src={foto} alt="" width={640} height={400} className="aspect-[16/10] w-full rounded-sm object-cover" />
                    </Link>
                  )}
                  <h3 className="font-serif text-xl leading-snug font-bold text-balance">
                    <Link href={`/berita/${pertama.slug}`} className="hover:underline">
                      {pertama.judul}
                    </Link>
                  </h3>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{pertama.subJudul ?? ringkas(pertama.isi, 200)}</p>
                </article>
                {lain.length > 0 && (
                  <ul className="grid content-start divide-y">
                    {lain.map((b) => (
                      <li key={b.id} className="py-3 first:pt-0 last:pb-0">
                        <h3 className="font-serif leading-snug font-semibold">
                          <Link href={`/berita/${b.slug}`} className="hover:underline">
                            {b.judul}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <time dateTime={b.publishedAt.toISOString()}>{formatTanggal(b.publishedAt)}</time>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
    </DenganSidebar>
  );
}
