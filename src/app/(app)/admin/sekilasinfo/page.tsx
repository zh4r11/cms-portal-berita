import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { InfoTable } from "./info-table";

export const metadata: Metadata = { title: "Sekilas Info" };

export default async function SekilasInfoPage() {
  await requireModul("sekilasinfo");
  const info = await prisma.sekilasInfo.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <PageContainer breadcrumbs={[{ title: "Sekilas Info" }]}>
      <InfoTable info={info.map((i) => ({ ...i, gambarUrl: mediaUrl("sekilasinfo", i.gambar) }))} />
    </PageContainer>
  );
}
