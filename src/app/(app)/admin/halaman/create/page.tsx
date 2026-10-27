import type { Metadata } from "next";
import PageHeader, { PageContainer } from "@/components/page-header";
import { requireModul } from "@/lib/session";
import { HalamanForm } from "../halaman-form";

export const metadata: Metadata = { title: "Buat halaman" };

export default async function CreateHalamanPage() {
  await requireModul("halaman");

  return (
    <PageContainer breadcrumbs={[{ title: "Halaman Statis", href: "/admin/halaman" }, { title: "Buat halaman" }]}>
      <PageHeader title="Buat halaman" />
      <HalamanForm initial={{ judul: "", slug: "", isi: "", gambar: null, hapusGambar: false }} />
    </PageContainer>
  );
}
