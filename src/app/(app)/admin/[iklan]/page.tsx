import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/page-header";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { IklanTable } from "./iklan-table";
import { isJenisIklan, JENIS_IKLAN, modelIklan } from "./jenis";

async function namaModul(jenis: string) {
  const modul = await prisma.modul.findUnique({ where: { link: jenis }, select: { nama: true } });

  return modul?.nama ?? jenis;
}

export async function generateMetadata({ params }: PageProps<"/admin/[iklan]">): Promise<Metadata> {
  const { iklan } = await params;

  return { title: isJenisIklan(iklan) ? await namaModul(iklan) : "Tidak ditemukan" };
}

export default async function IklanPage({ params }: PageProps<"/admin/[iklan]">) {
  const { iklan } = await params;

  if (!isJenisIklan(iklan)) {
    notFound();
  }

  await requireModul(iklan);
  const [rows, title] = await Promise.all([modelIklan(iklan).findMany({ orderBy: { createdAt: "desc" } }), namaModul(iklan)]);

  return (
    <PageContainer breadcrumbs={[{ title }]}>
      <IklanTable
        jenis={iklan}
        title={title}
        description={JENIS_IKLAN[iklan].posisi}
        ukuran={JENIS_IKLAN[iklan].ukuran}
        rows={rows.map((r) => ({ id: r.id, judul: r.judul, url: r.url, createdAt: r.createdAt, gambarUrl: mediaUrl(iklan, r.gambar)! }))}
      />
    </PageContainer>
  );
}
