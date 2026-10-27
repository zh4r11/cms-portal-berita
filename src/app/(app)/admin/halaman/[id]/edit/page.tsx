import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader, { PageContainer } from "@/components/page-header";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { HalamanForm } from "../../halaman-form";

export const metadata: Metadata = { title: "Ubah halaman" };

export default async function EditHalamanPage({ params }: PageProps<"/admin/halaman/[id]/edit">) {
  await requireModul("halaman");
  const id = Number((await params).id);
  const halaman = Number.isInteger(id) ? await prisma.halamanStatis.findUnique({ where: { id } }) : null;

  if (!halaman) {
    notFound();
  }

  return (
    <PageContainer breadcrumbs={[{ title: "Halaman Statis", href: "/admin/halaman" }, { title: "Ubah halaman" }]}>
      <PageHeader title="Ubah halaman" />
      <HalamanForm
        id={halaman.id}
        gambarUrl={mediaUrl("halaman", halaman.gambar)}
        initial={{ judul: halaman.judul, slug: halaman.slug, isi: halaman.isi, gambar: null, hapusGambar: false }}
      />
    </PageContainer>
  );
}
