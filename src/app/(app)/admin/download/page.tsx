import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { DownloadTable } from "./download-table";

export const metadata: Metadata = { title: "Download" };

export default async function DownloadPage() {
  await requireModul("download");
  const download = await prisma.download.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <PageContainer breadcrumbs={[{ title: "Download" }]}>
      <DownloadTable download={download} />
    </PageContainer>
  );
}
