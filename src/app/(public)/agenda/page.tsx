import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Pagination from "@/components/pagination";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { hariIni, toDbDate } from "@/lib/dates";
import { formatTanggal } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { paginate, param, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Agenda" };

const bulanTahun = new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric", timeZone: "UTC" });

export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const query = await searchParams;
  const lewat = param(query.waktu) === "lewat";
  const hari = toDbDate(hariIni());
  const where = lewat ? { tglSelesai: { lt: hari } } : { tglSelesai: { gte: hari } };
  const total = await prisma.agenda.count({ where });
  const page = paginate(parsePage(query.page), total);
  const agenda = await prisma.agenda.findMany({
    where,
    orderBy: { tglMulai: lewat ? "desc" : "asc" },
    skip: page.skip,
    take: page.take,
    select: { id: true, tema: true, slug: true, tempat: true, jam: true, gambar: true, tglMulai: true, tglSelesai: true },
  });

  return (
    <DenganSidebar>
      <JudulBagian as="h1">Agenda</JudulBagian>
      <nav aria-label="Waktu agenda" className="mb-6 flex gap-1">
        {[
          { label: "Akan datang", href: "/agenda", aktif: !lewat },
          { label: "Sudah lewat", href: "/agenda?waktu=lewat", aktif: lewat },
        ].map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.aktif ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center rounded-md px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring pointer-coarse:h-11",
              t.aktif ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {agenda.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          <CalendarDays className="size-8" />
          <p>{lewat ? "Belum ada agenda yang sudah lewat." : "Belum ada acara mendatang. Agenda yang sudah lewat ada di tab sebelah."}</p>
        </div>
      ) : (
        <ul className="divide-y">
          {agenda.map((a) => (
            <li key={a.id} className="grid grid-cols-[4.5rem_1fr] gap-4 py-4 first:pt-0 sm:grid-cols-[4.5rem_1fr_8rem]">
              <p className="text-center">
                <span className="block font-serif text-3xl leading-none font-bold text-primary">{a.tglMulai.getUTCDate()}</span>
                <span className="text-xs text-muted-foreground">{bulanTahun.format(a.tglMulai)}</span>
              </p>
              <div className="min-w-0 space-y-1">
                <h2 className="font-serif text-lg leading-snug font-semibold">
                  <Link href={`/agenda/${a.slug}`} className="hover:underline">
                    {a.tema}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {a.tempat} · {a.jam}
                  {a.tglSelesai.getTime() !== a.tglMulai.getTime() && ` · sampai ${formatTanggal(a.tglSelesai)}`}
                </p>
              </div>
              {a.gambar && (
                <Image
                  src={mediaUrl("agenda", a.gambar)!}
                  alt=""
                  width={256}
                  height={180}
                  className="hidden aspect-[4/3] w-full rounded-sm object-cover sm:block"
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Pagination meta={page.meta(agenda.length)} />
      </div>
    </DenganSidebar>
  );
}
