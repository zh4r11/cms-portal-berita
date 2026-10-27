import type { Metadata } from "next";
import { DaftarBerita } from "@/components/portal/daftar-berita";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { parsePage } from "@/lib/pagination";

export const metadata: Metadata = { title: "Indeks berita" };

export default async function IndeksPage({ searchParams }: PageProps<"/berita">) {
  const { page } = await searchParams;

  return (
    <DenganSidebar>
      <JudulBagian as="h1">Indeks Berita</JudulBagian>
      <DaftarBerita page={parsePage(page)} kosong="Belum ada berita yang terbit." />
    </DenganSidebar>
  );
}
