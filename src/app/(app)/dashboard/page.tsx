import type { Metadata } from "next";
import Link from "next/link";
import { CountUp } from "@/components/count-up";
import { PageContainer } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hariIni, toDbDate } from "@/lib/dates";
import { formatAngka, formatTanggalSingkat, formatWaktu } from "@/lib/format";
import type { ModulKey } from "@/lib/modul";
import { prisma } from "@/lib/prisma";
import { getAkses, requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { GrafikKunjungan, type BarisKunjungan } from "./grafik";

export const metadata: Metadata = { title: "Dashboard" };

const HARI_GRAFIK = 14;
const formatHari = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

export default async function DashboardPage() {
  const user = await requireUser();
  const akses = await getAkses();
  const milik = user.level === "admin" ? {} : { authorId: user.id };

  const hari = hariIni();
  const awalGrafik = new Date(toDbDate(hari).getTime() - (HARI_GRAFIK - 1) * 86_400_000);
  // Hari ini ditambah enam hari sebelumnya.
  const seminggu = new Date(toDbDate(hari).getTime() - 6 * 86_400_000);

  const [terbit, draf, pesanBaru, komentarMinggu, hariIniStat, totalPengunjung, kunjungan, populer, komentarBaru, video, foto] =
    await Promise.all([
      prisma.berita.count({ where: { ...milik, aktif: true } }),
      prisma.berita.count({ where: { ...milik, aktif: false } }),
      prisma.hubungi.count({ where: { dibaca: false } }),
      prisma.komentar.count({ where: { createdAt: { gte: seminggu } } }),
      prisma.statistik.aggregate({ where: { tanggal: toDbDate(hari) }, _count: { _all: true }, _sum: { hits: true } }),
      prisma.statistik.count(),
      prisma.statistik.groupBy({ by: ["tanggal"], where: { tanggal: { gte: awalGrafik } }, _count: { _all: true }, _sum: { hits: true } }),
      prisma.berita.findMany({
        where: { ...milik, aktif: true },
        orderBy: { dibaca: "desc" },
        take: 5,
        select: { id: true, judul: true, slug: true, dibaca: true },
      }),
      prisma.komentar.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, nama: true, isi: true, createdAt: true, berita: { select: { judul: true } } },
      }),
      prisma.video.count(),
      prisma.galeri.count(),
    ]);

  const grafik: BarisKunjungan[] = Array.from({ length: HARI_GRAFIK }, (_, i) => {
    const tanggal = new Date(awalGrafik.getTime() + i * 86_400_000);
    const row = kunjungan.find((k) => k.tanggal.getTime() === tanggal.getTime());

    return { tanggal: formatHari.format(tanggal), pengunjung: row?._count._all ?? 0, hits: row?._sum.hits ?? 0 };
  });
  const adaKunjungan = grafik.some((g) => g.pengunjung > 0);
  const boleh = (key: ModulKey) => akses.has(key);

  return (
    <PageContainer breadcrumbs={[{ title: "Dashboard" }]}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Selamat bekerja, {user.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">
          {user.level === "admin" ? "Ringkasan redaksi hari ini." : "Ringkasan berita yang Anda tulis dan aktivitas pembaca."}
        </p>
      </div>

      <section aria-labelledby="perhatian" className="grid gap-4 md:grid-cols-3">
        <h2 id="perhatian" className="sr-only">
          Perlu perhatian
        </h2>
        <Tugas
          angka={draf}
          label="draf belum terbit"
          kosong="Tidak ada draf. Semua tulisan sudah terbit."
          href={boleh("berita") ? "/admin/berita?status=draf" : undefined}
          aksi="Buka draf"
        />
        <Tugas
          angka={pesanBaru}
          label="pesan belum dibaca"
          kosong="Semua pesan pembaca sudah dibaca."
          href={boleh("hubungi") ? "/admin/hubungi" : undefined}
          aksi="Baca pesan"
        />
        <Tugas
          angka={komentarMinggu}
          label="komentar 7 hari terakhir"
          kosong="Belum ada komentar baru minggu ini."
          href={boleh("komentar") ? "/admin/komentar" : undefined}
          aksi="Moderasi komentar"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Pengunjung per hari, {HARI_GRAFIK} hari terakhir</CardTitle>
            <CardDescription>Dihitung per alamat IP per hari dari halaman portal.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <dl className="grid grid-cols-3 gap-4">
              <Angka label="Pengunjung hari ini" value={hariIniStat._count._all} />
              <Angka label="Halaman dibuka hari ini" value={hariIniStat._sum.hits ?? 0} />
              <Angka label="Kunjungan sepanjang waktu" value={totalPengunjung} />
            </dl>
            {adaKunjungan ? (
              <GrafikKunjungan data={grafik} />
            ) : (
              <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                Belum ada kunjungan dalam {HARI_GRAFIK} hari terakhir. Data statistik hasil impor berasal dari tahun-tahun sebelumnya.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Paling banyak dibaca</CardTitle>
            <CardDescription>{user.level === "admin" ? "Seluruh berita terbit" : "Berita terbit tulisan Anda"}</CardDescription>
          </CardHeader>
          <CardContent>
            {populer.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Belum ada berita yang terbit.</p>
            ) : (
              <ol className="divide-y">
                {populer.map((b, i) => (
                  <li key={b.id} className="flex items-baseline gap-3 py-2.5">
                    <span className="w-4 shrink-0 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                    <a href={`/berita/${b.slug}`} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 text-sm hover:underline">
                      {b.judul}
                    </a>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatAngka(b.dibaca)}×</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Komentar terbaru</CardTitle>
            <CardDescription>Komentar langsung tampil di portal tanpa persetujuan.</CardDescription>
            {boleh("komentar") && komentarBaru.length > 0 && (
              <CardAction>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/komentar">Semua komentar</Link>
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            {komentarBaru.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Belum ada komentar dari pembaca.</p>
            ) : (
              <ul className="divide-y">
                {komentarBaru.map((k) => (
                  <li key={k.id} className="space-y-1 py-3">
                    <p className="line-clamp-2 text-sm">{k.isi}</p>
                    <p className="text-xs text-muted-foreground">
                      {k.nama} pada <span className="italic">{k.berita.judul}</span> · {formatWaktu(k.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Isi portal</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Angka label={user.level === "admin" ? "Berita terbit" : "Berita terbit Anda"} value={terbit} />
              <Angka label="Draf" value={draf} />
              <Angka label="Video" value={video} />
              <Angka label="Foto galeri" value={foto} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">Data per {formatTanggalSingkat(hari)}.</p>
    </PageContainer>
  );
}

/** Kartu tugas: angkanya adalah fokus, tombol membawa ke tempat menyelesaikannya. */
function Tugas({ angka, label, kosong, href, aksi }: { angka: number; label: string; kosong: string; href?: string; aksi: string }) {
  return (
    <Card className={cn("gap-3 py-5", angka > 0 && "border-primary/50")}>
      <CardContent className="grid gap-3 px-5">
        <p className="flex items-baseline gap-2">
          <span className={cn("font-serif text-4xl font-semibold tabular-nums", angka > 0 ? "text-primary" : "text-muted-foreground")}>
            <CountUp value={angka} />
          </span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </p>
        {angka > 0 && href ? (
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href={href}>{aksi}</Link>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">{angka > 0 ? "Anda tidak punya akses ke modul ini." : kosong}</p>
        )}
      </CardContent>
    </Card>
  );
}

function Angka({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">
        <CountUp value={value} />
      </dd>
    </div>
  );
}
