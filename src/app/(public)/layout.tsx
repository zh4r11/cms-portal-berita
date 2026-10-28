import { Rss } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CatatKunjungan } from "@/components/portal/catat-kunjungan";
import { Iklan } from "@/components/portal/iklan";
import { PortalNav } from "@/components/portal/portal-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { bersihkanHtml } from "@/lib/content";
import { formatTanggal } from "@/lib/format";
import { hariIni } from "@/lib/dates";
import { mediaUrl } from "@/lib/media";
import { getMenu, getTampilan } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { getIdentitas } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Pita (garis, latar) membentang selebar layar; isinya dibatasi lebar ini agar baris teks tetap nyaman dibaca. */
const LEBAR = "mx-auto w-full max-w-7xl px-4";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [identitas, menu, tampilan, halaman] = await Promise.all([
    getIdentitas(),
    getMenu(),
    getTampilan(),
    prisma.halamanStatis.findMany({ orderBy: { judul: "asc" }, select: { judul: true, slug: true }, take: 8 }),
  ]);
  const { logo, header, iklanAtas, sekilas, alamat } = tampilan;

  return (
    <div className="flex min-h-svh flex-col">
      <CatatKunjungan />
      <a
        href="#isi"
        className="sr-only z-50 rounded-md bg-background px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-3 focus:ring-ring"
      >
        Langsung ke isi
      </a>

      <div className="flex flex-1 flex-col">
        <div className="border-b">
          <div className={cn(LEBAR, "flex items-center justify-between gap-2 py-1 text-xs text-muted-foreground")}>
            <span>{formatTanggal(hariIni())}</span>
            <div className="flex items-center gap-1">
              <a href="/rss.xml" className="inline-flex h-8 items-center gap-1 rounded-sm px-2 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring">
                <Rss className="size-3.5" />
                RSS
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <header className={cn(LEBAR, "grid gap-4 py-5 md:grid-cols-[auto_1fr] md:items-center")}>
          <Link
            href="/"
            // Logo unggahan umumnya berlatar putih; di mode gelap diberi pelat putih agar tidak tampak seperti kotak tempelan.
            className={cn("w-fit rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring", logo && "dark:bg-white dark:px-3 dark:py-2")}
          >
            {logo ? (
              <Image
                src={mediaUrl("logo", logo.gambar)!}
                alt={identitas.namaWebsite}
                width={360}
                height={90}
                priority
                className="h-14 w-auto max-w-full object-contain md:h-20"
              />
            ) : (
              <span className="font-serif text-3xl font-bold tracking-tight md:text-4xl">{identitas.namaWebsite}</span>
            )}
          </Link>
          {iklanAtas && (
            <Iklan className="md:justify-self-end" imgClassName="h-auto max-h-24 w-auto" url={iklanAtas.url} judul={iklanAtas.judul} src={mediaUrl("iklanatas", iklanAtas.gambar)!} width={728} height={90} />
          )}
        </header>

        {header && (
          <Iklan url={header.url} judul={header.judul} src={mediaUrl("header", header.gambar)!} width={1200} height={200} className={LEBAR} />
        )}

        <div className="sticky top-0 z-30 border-y-2 border-y-primary/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
          <div className="mx-auto w-full max-w-7xl px-2">
            <PortalNav menu={menu} />
          </div>
        </div>

        {sekilas.length > 0 && (
          // Satu baris berjalan agar berita pertama tidak terdorong ke bawah; daftar digandakan supaya putarannya menyambung.
          <section aria-label="Sekilas info" className="border-b text-sm">
            <div className={cn(LEBAR, "flex items-center px-0 sm:px-4")}>
              <span className="shrink-0 self-stretch bg-primary px-4 py-2 font-semibold text-primary-foreground">Sekilas</span>
              <div className="group min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto">
                <div className="flex w-max animate-sekilas group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                  {[0, 1].map((salinan) => (
                    <ul key={salinan} aria-hidden={salinan === 1 || undefined} className={cn("flex shrink-0", salinan === 1 && "motion-reduce:hidden")}>
                      {sekilas.map((s) => (
                        <li key={s.id} className="py-2 pl-6 whitespace-nowrap text-muted-foreground before:mr-6 before:text-primary before:content-['•']">
                          {s.info}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <main id="isi" className={cn(LEBAR, "flex-1 py-6")}>
          {children}
        </main>

        <footer className="border-t-2 border-t-primary/80 bg-muted/40 py-8 text-sm">
          <div className={cn(LEBAR, "grid gap-8 md:grid-cols-[2fr_1fr]")}>
            <div className="space-y-3">
              <p className="font-serif text-xl font-semibold">{identitas.namaWebsite}</p>
              {alamat && (
                <div
                  className="isi-artikel text-sm text-muted-foreground [&>*+*]:mt-0"
                  dangerouslySetInnerHTML={{ __html: bersihkanHtml(alamat.alamat) }}
                />
              )}
              {identitas.facebook && (
                <a href={identitas.facebook} target="_blank" rel="noopener noreferrer" className="inline-block underline underline-offset-4">
                  Halaman Facebook
                </a>
              )}
            </div>
            <nav aria-label="Tautan kaki">
              <ul className="grid gap-1.5">
                {halaman.map((h) => (
                  <li key={h.slug}>
                    <Link href={`/halaman/${h.slug}`} className="hover:underline">
                      {h.judul}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/hubungi" className="hover:underline">
                    Hubungi redaksi
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-muted-foreground hover:underline">
                    Masuk panel redaksi
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
