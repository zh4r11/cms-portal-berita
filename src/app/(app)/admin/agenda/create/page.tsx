import type { Metadata } from "next";
import PageHeader, { PageContainer } from "@/components/page-header";
import { hariIni } from "@/lib/dates";
import { requireModul } from "@/lib/session";
import { AgendaForm } from "../agenda-form";

export const metadata: Metadata = { title: "Tambah agenda" };

export default async function CreateAgendaPage() {
  await requireModul("agenda");
  const hari = hariIni();

  return (
    <PageContainer breadcrumbs={[{ title: "Agenda", href: "/admin/agenda" }, { title: "Tambah agenda" }]}>
      <PageHeader title="Tambah agenda" />
      <AgendaForm
        initial={{ tema: "", slug: "", isi: "", tempat: "", pengirim: "", jam: "", tglMulai: hari, tglSelesai: hari, gambar: null, hapusGambar: false }}
      />
    </PageContainer>
  );
}
