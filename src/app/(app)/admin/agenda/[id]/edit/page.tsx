import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader, { PageContainer } from "@/components/page-header";
import { fromDbDate } from "@/lib/dates";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { AgendaForm } from "../../agenda-form";

export const metadata: Metadata = { title: "Ubah agenda" };

export default async function EditAgendaPage({ params }: PageProps<"/admin/agenda/[id]/edit">) {
  await requireModul("agenda");
  const id = Number((await params).id);
  const agenda = Number.isInteger(id) ? await prisma.agenda.findUnique({ where: { id } }) : null;

  if (!agenda) {
    notFound();
  }

  return (
    <PageContainer breadcrumbs={[{ title: "Agenda", href: "/admin/agenda" }, { title: "Ubah agenda" }]}>
      <PageHeader title="Ubah agenda" />
      <AgendaForm
        id={agenda.id}
        gambarUrl={mediaUrl("agenda", agenda.gambar)}
        initial={{
          tema: agenda.tema,
          slug: agenda.slug,
          isi: agenda.isi,
          tempat: agenda.tempat,
          pengirim: agenda.pengirim,
          jam: agenda.jam,
          tglMulai: fromDbDate(agenda.tglMulai),
          tglSelesai: fromDbDate(agenda.tglSelesai),
          gambar: null,
          hapusGambar: false,
        }}
      />
    </PageContainer>
  );
}
