import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { PolingTable } from "./poling-table";

export const metadata: Metadata = { title: "Jajak Pendapat" };

export default async function PolingPage() {
  await requireModul("poling");
  const poling = await prisma.poling.findMany({ orderBy: [{ status: "asc" }, { rating: "desc" }, { id: "asc" }] });

  return (
    <PageContainer breadcrumbs={[{ title: "Jajak Pendapat" }]}>
      <PolingTable poling={poling} />
    </PageContainer>
  );
}
