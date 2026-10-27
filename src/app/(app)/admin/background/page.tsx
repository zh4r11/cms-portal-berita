import type { Metadata } from "next";
import { GambarTunggal } from "@/components/gambar-tunggal";
import { PageContainer } from "@/components/page-header";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusBackground, simpanBackground } from "./actions";

export const metadata: Metadata = { title: "Background" };

export default async function BackgroundPage() {
  await requireModul("background");
  const background = await prisma.background.findFirst({ orderBy: { id: "desc" } });

  return (
    <PageContainer breadcrumbs={[{ title: "Background" }]}>
      <GambarTunggal
        title="Background"
        description="Gambar latar halaman portal di luar area isi. Area isi tetap berwarna polos agar teks terbaca."
        current={mediaUrl("background", background?.gambar)}
        simpan={simpanBackground}
        hapus={hapusBackground}
      />
    </PageContainer>
  );
}
