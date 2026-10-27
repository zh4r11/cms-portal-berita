import type { Metadata } from "next";
import PageHeader, { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { AlamatForm } from "./alamat-form";

export const metadata: Metadata = { title: "Alamat Kontak" };

export default async function AlamatPage() {
  await requireModul("alamat");
  const alamat = await prisma.modAlamat.findFirst({ orderBy: { id: "asc" } });

  return (
    <PageContainer breadcrumbs={[{ title: "Alamat Kontak" }]}>
      <PageHeader title="Alamat Kontak" description="Alamat kantor redaksi yang tampil di halaman Hubungi Kami dan kaki portal." />
      <AlamatForm alamat={alamat?.alamat ?? ""} />
    </PageContainer>
  );
}
