import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { TagTable } from "@/components/tag-table";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusTagVideo, tambahTagVideo, ubahTagVideo } from "./actions";

export const metadata: Metadata = { title: "Tag Video" };

export default async function TagVideoPage() {
  await requireModul("tagvideo");
  const tags = await prisma.tagVideo.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true, slug: true, _count: { select: { video: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Tag Video" }]}>
      <TagTable
        title="Tag Video"
        description="Tag dipilih saat mengisi video dan tampil di halaman video."
        satuan="Video"
        tags={tags.map((t) => ({ id: t.id, nama: t.nama, slug: t.slug, jumlah: t._count.video }))}
        tambah={tambahTagVideo}
        ubah={ubahTagVideo}
        hapus={hapusTagVideo}
      />
    </PageContainer>
  );
}
