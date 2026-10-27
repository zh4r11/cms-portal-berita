import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { YmTable } from "./ym-table";

export const metadata: Metadata = { title: "Kontak YM" };

export default async function YmPage() {
  await requireModul("ym");
  const kontak = await prisma.modYm.findMany({ orderBy: { nama: "asc" } });

  return (
    <PageContainer breadcrumbs={[{ title: "Kontak YM" }]}>
      <YmTable kontak={kontak} />
    </PageContainer>
  );
}
