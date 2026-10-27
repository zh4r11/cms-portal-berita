import { cookies } from "next/headers";
import Link from "next/link";
import { formatAngka, formatTanggalSingkat } from "@/lib/format";
import { hariIni, toDbDate } from "@/lib/dates";
import { mediaUrl } from "@/lib/media";
import { beritaTerbit } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { Iklan } from "./iklan";
import { JudulBagian } from "./judul-bagian";
import { PolingWidget } from "./poling-widget";

/** Kolom kanan: terpopuler, jajak pendapat, agenda, lalu iklan. Bagian tanpa isi tidak ditampilkan. */
export async function Sidebar() {
  const [populer, pertanyaan, jawaban, agenda, banner, pasangIklan] = await Promise.all([
    prisma.berita.findMany({ where: beritaTerbit(), orderBy: { dibaca: "desc" }, take: 5, select: { id: true, judul: true, slug: true, dibaca: true } }),
    prisma.poling.findFirst({ where: { status: "pertanyaan", aktif: true } }),
    prisma.poling.findMany({ where: { status: "jawaban", aktif: true }, orderBy: { id: "asc" }, select: { id: true, pilihan: true } }),
    prisma.agenda.findMany({
      where: { tglSelesai: { gte: toDbDate(hariIni()) } },
      orderBy: { tglMulai: "asc" },
      take: 3,
      select: { id: true, tema: true, slug: true, tglMulai: true, tempat: true },
    }),
    prisma.banner.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.pasangIklan.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const sudahMemilih = !!pertanyaan && (await cookies()).get("poling_dipilih")?.value === String(pertanyaan.id);

  return (
    <aside className="grid content-start gap-8" aria-label="Sidebar">
      {populer.length > 0 && (
        <section aria-labelledby="populer">
          <JudulBagian id="populer">Terpopuler</JudulBagian>
          <ol className="grid gap-3">
            {populer.map((b, i) => (
              <li key={b.id} className="grid grid-cols-[1.5rem_1fr] gap-2">
                <span className="font-serif text-xl leading-none font-bold text-primary tabular-nums">{i + 1}</span>
                <div>
                  <Link href={`/berita/${b.slug}`} className="text-sm leading-snug font-medium hover:underline">
                    {b.judul}
                  </Link>
                  <p className="text-xs text-muted-foreground">{formatAngka(b.dibaca)} kali dibaca</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {pertanyaan && jawaban.length > 0 && (
        <section aria-labelledby="poling">
          <JudulBagian id="poling">Jajak Pendapat</JudulBagian>
          <PolingWidget pertanyaan={pertanyaan.pilihan} jawaban={jawaban} sudahMemilih={sudahMemilih} />
        </section>
      )}

      <section aria-labelledby="agenda">
        <JudulBagian id="agenda" href="/agenda" hrefLabel="Semua agenda">
          Agenda
        </JudulBagian>
        {agenda.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada acara mendatang.</p>
        ) : (
          <ul className="grid gap-3">
            {agenda.map((a) => (
              <li key={a.id}>
                <Link href={`/agenda/${a.slug}`} className="text-sm font-medium hover:underline">
                  {a.tema}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatTanggalSingkat(a.tglMulai)} · {a.tempat}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {banner.length > 0 && (
        <section aria-label="Tautan pilihan" className="grid gap-3">
          {banner.map((b) => (
            <Iklan key={b.id} url={b.url} judul={b.judul} src={mediaUrl("banner", b.gambar)!} width={300} height={100} />
          ))}
        </section>
      )}

      {pasangIklan.length > 0 && (
        <section aria-label="Iklan" className="grid gap-3">
          <p className="text-xs text-muted-foreground">Iklan</p>
          {pasangIklan.map((p) => (
            <Iklan key={p.id} url={p.url} judul={p.judul} src={mediaUrl("pasangiklan", p.gambar)!} width={300} height={250} imgClassName="h-auto max-h-80 w-full" />
          ))}
        </section>
      )}
    </aside>
  );
}
