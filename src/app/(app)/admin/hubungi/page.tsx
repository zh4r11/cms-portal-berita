import type { Metadata } from "next";
import PageHeader, { PageContainer } from "@/components/page-header";
import SearchInput from "@/components/search-input";
import type { Prisma } from "@/generated/prisma/client";
import { paginate, param, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { PesanTable } from "./pesan-table";

export const metadata: Metadata = { title: "Pesan Masuk" };

export default async function HubungiPage({ searchParams }: PageProps<"/admin/hubungi">) {
  await requireModul("hubungi");
  const query = await searchParams;
  const cari = param(query.cari);
  const where: Prisma.HubungiWhereInput = cari
    ? {
        OR: [
          { nama: { contains: cari, mode: "insensitive" } },
          { email: { contains: cari, mode: "insensitive" } },
          { subjek: { contains: cari, mode: "insensitive" } },
        ],
      }
    : {};

  const [total, belum] = await Promise.all([prisma.hubungi.count({ where }), prisma.hubungi.count({ where: { dibaca: false } })]);
  const page = paginate(parsePage(query.page), total);
  const pesan = await prisma.hubungi.findMany({ where, orderBy: { createdAt: "desc" }, skip: page.skip, take: page.take });

  return (
    <PageContainer breadcrumbs={[{ title: "Pesan Masuk" }]}>
      <PageHeader
        title="Pesan Masuk"
        description={belum ? `${belum} pesan dari form Hubungi Kami belum dibaca.` : "Semua pesan dari form Hubungi Kami sudah dibaca."}
      />
      <SearchInput value={cari} placeholder="Cari nama, email, atau subjek..." />
      <PesanTable pesan={pesan} meta={page.meta(pesan.length)} cari={cari} />
    </PageContainer>
  );
}
