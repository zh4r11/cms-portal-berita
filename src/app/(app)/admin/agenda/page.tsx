import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader, { PageContainer } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { AgendaTable } from "./agenda-table";

export const metadata: Metadata = { title: "Agenda" };

export default async function AgendaPage() {
  await requireModul("agenda");
  const agenda = await prisma.agenda.findMany({
    orderBy: { tglMulai: "desc" },
    select: { id: true, tema: true, slug: true, tempat: true, gambar: true, tglMulai: true, tglSelesai: true, jam: true },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Agenda" }]}>
      <PageHeader title="Agenda" description="Acara yang tampil di halaman Agenda dan sidebar portal.">
        <Button asChild>
          <Link href="/admin/agenda/create">
            <Plus />
            Tambah agenda
          </Link>
        </Button>
      </PageHeader>
      <AgendaTable agenda={agenda.map((a) => ({ ...a, gambarUrl: mediaUrl("agenda", a.gambar) }))} />
    </PageContainer>
  );
}
