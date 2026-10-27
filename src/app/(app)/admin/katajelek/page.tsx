import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { KataTable } from "./kata-table";

export const metadata: Metadata = { title: "Sensor Kata" };

export default async function KataJelekPage() {
  await requireModul("katajelek");
  const kata = await prisma.kataJelek.findMany({ orderBy: { kata: "asc" } });

  return (
    <PageContainer breadcrumbs={[{ title: "Sensor Kata" }]}>
      <KataTable kata={kata} />
    </PageContainer>
  );
}
