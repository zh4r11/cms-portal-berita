import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { bersihkanHtml } from "@/lib/content";
import { formatTanggal } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";

const getAgenda = cache(async (slug: string) => prisma.agenda.findUnique({ where: { slug } }));

export async function generateMetadata({ params }: PageProps<"/agenda/[slug]">): Promise<Metadata> {
  const agenda = await getAgenda((await params).slug);

  return { title: agenda?.tema ?? "Agenda tidak ditemukan" };
}

export default async function AgendaDetailPage({ params }: PageProps<"/agenda/[slug]">) {
  const agenda = await getAgenda((await params).slug);

  if (!agenda) {
    notFound();
  }

  await prisma.agenda.update({ where: { id: agenda.id }, data: { dibaca: { increment: 1 } } });
  const sama = agenda.tglSelesai.getTime() === agenda.tglMulai.getTime();
  const gambar = mediaUrl("agenda", agenda.gambar);

  return (
    <DenganSidebar>
      <article className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl font-bold text-balance sm:text-4xl">{agenda.tema}</h1>
        <dl className="mt-4 grid gap-x-4 gap-y-2 rounded-lg border p-4 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted-foreground">Tanggal</dt>
          <dd>{sama ? formatTanggal(agenda.tglMulai) : `${formatTanggal(agenda.tglMulai)} sampai ${formatTanggal(agenda.tglSelesai)}`}</dd>
          <dt className="text-muted-foreground">Jam</dt>
          <dd>{agenda.jam}</dd>
          <dt className="text-muted-foreground">Tempat</dt>
          <dd>{agenda.tempat}</dd>
          <dt className="text-muted-foreground">Penyelenggara</dt>
          <dd>{agenda.pengirim}</dd>
        </dl>
        {gambar && <Image src={gambar} alt={`Poster ${agenda.tema}`} width={1200} height={900} className="my-6 h-auto w-full rounded-sm" />}
        <div className="isi-artikel mt-6" dangerouslySetInnerHTML={{ __html: bersihkanHtml(agenda.isi) }} />
      </article>
    </DenganSidebar>
  );
}
