import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader, { PageContainer } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { HalamanTable } from "./halaman-table";

export const metadata: Metadata = { title: "Halaman Statis" };

export default async function HalamanPage() {
  await requireModul("halaman");
  const halaman = await prisma.halamanStatis.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, judul: true, slug: true, dibaca: true, createdAt: true },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Halaman Statis" }]}>
      <PageHeader title="Halaman Statis" description="Halaman tetap seperti Profil Redaksi atau Pedoman Media Siber. Pasang tautannya lewat Menu Website.">
        <Button asChild>
          <Link href="/admin/halaman/create">
            <Plus />
            Buat halaman
          </Link>
        </Button>
      </PageHeader>
      <HalamanTable halaman={halaman} />
    </PageContainer>
  );
}
