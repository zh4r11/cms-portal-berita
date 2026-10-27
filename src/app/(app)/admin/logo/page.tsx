import type { Metadata } from "next";
import { GambarTunggal } from "@/components/gambar-tunggal";
import { PageContainer } from "@/components/page-header";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusLogo, simpanLogo } from "./actions";

export const metadata: Metadata = { title: "Logo" };

export default async function LogoPage() {
  await requireModul("logo");
  const logo = await prisma.logo.findFirst({ orderBy: { id: "desc" } });

  return (
    <PageContainer breadcrumbs={[{ title: "Logo" }]}>
      <GambarTunggal
        title="Logo"
        description="Tampil di kiri atas portal. Tanpa logo, nama situs dari Identitas Website ditampilkan sebagai teks."
        current={mediaUrl("logo", logo?.gambar)}
        simpan={simpanLogo}
        hapus={hapusLogo}
      />
    </PageContainer>
  );
}
