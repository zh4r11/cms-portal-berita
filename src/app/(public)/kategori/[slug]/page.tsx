import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DaftarBerita } from "@/components/portal/daftar-berita";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

const getKategori = cache(async (slug: string) => prisma.kategori.findUnique({ where: { slug } }));

export async function generateMetadata({ params }: PageProps<"/kategori/[slug]">): Promise<Metadata> {
  const kategori = await getKategori((await params).slug);

  return { title: kategori ? `Berita ${kategori.nama}` : "Kategori tidak ditemukan" };
}

export default async function KategoriPage({ params, searchParams }: PageProps<"/kategori/[slug]">) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const kategori = await getKategori(slug);

  if (!kategori) {
    notFound();
  }

  return (
    <DenganSidebar>
      <JudulBagian as="h1">{kategori.nama}</JudulBagian>
      <DaftarBerita where={{ kategoriId: kategori.id }} page={parsePage(page)} kosong={`Belum ada berita di rubrik ${kategori.nama}.`} />
    </DenganSidebar>
  );
}
