import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DaftarBerita } from "@/components/portal/daftar-berita";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

const getTag = cache(async (slug: string) => prisma.tag.findUnique({ where: { slug } }));

export async function generateMetadata({ params }: PageProps<"/tag/[slug]">): Promise<Metadata> {
  const tag = await getTag((await params).slug);

  return { title: tag ? `Tag ${tag.nama}` : "Tag tidak ditemukan" };
}

export default async function TagPage({ params, searchParams }: PageProps<"/tag/[slug]">) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const tag = await getTag(slug);

  if (!tag) {
    notFound();
  }

  return (
    <DenganSidebar>
      <JudulBagian as="h1">#{tag.nama}</JudulBagian>
      <DaftarBerita where={{ tags: { some: { id: tag.id } } }} page={parsePage(page)} kosong={`Belum ada berita dengan tag ${tag.nama}.`} />
    </DenganSidebar>
  );
}
