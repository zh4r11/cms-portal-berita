import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { TagTable } from "@/components/tag-table";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { hapusTag, tambahTag, ubahTag } from "./actions";

export const metadata: Metadata = { title: "Tag Berita" };

export default async function TagPage() {
  await requireModul("tag");
  const tags = await prisma.tag.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true, slug: true, _count: { select: { berita: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Tag Berita" }]}>
      <TagTable
        title="Tag Berita"
        description="Tag dipilih saat menulis berita dan tampil sebagai tautan di bawah artikel."
        satuan="Berita"
        prefix="/tag/"
        tags={tags.map((t) => ({ id: t.id, nama: t.nama, slug: t.slug, jumlah: t._count.berita }))}
        tambah={tambahTag}
        ubah={ubahTag}
        hapus={hapusTag}
      />
    </PageContainer>
  );
}
