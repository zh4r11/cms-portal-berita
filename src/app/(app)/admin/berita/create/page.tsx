import type { Metadata } from "next";
import PageHeader, { PageContainer } from "@/components/page-header";
import { toDatetimeLocal } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { BeritaForm } from "../berita-form";

export const metadata: Metadata = { title: "Tulis berita" };

export default async function CreateBeritaPage() {
  await requireModul("berita");
  const [kategori, tags] = await Promise.all([
    prisma.kategori.findMany({ where: { aktif: true }, orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.tag.findMany({ orderBy: { nama: "asc" }, select: { nama: true } }),
  ]);

  return (
    <PageContainer breadcrumbs={[{ title: "Berita", href: "/admin/berita" }, { title: "Tulis berita" }]}>
      <PageHeader title="Tulis berita" />
      <BeritaForm
        kategori={kategori}
        tags={tags.map((t) => t.nama)}
        initial={{
          judul: "",
          subJudul: "",
          slug: "",
          kategoriId: "",
          isi: "",
          youtube: "",
          keteranganGambar: "",
          tags: [],
          headline: false,
          utama: false,
          aktif: false,
          publishedAt: toDatetimeLocal(new Date()),
          gambar: null,
          hapusGambar: false,
        }}
      />
    </PageContainer>
  );
}
