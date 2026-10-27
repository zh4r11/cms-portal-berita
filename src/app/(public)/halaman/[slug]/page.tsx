import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { bersihkanHtml, ringkas } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";

const getHalaman = cache(async (slug: string) => prisma.halamanStatis.findUnique({ where: { slug } }));

export async function generateMetadata({ params }: PageProps<"/halaman/[slug]">): Promise<Metadata> {
  const halaman = await getHalaman((await params).slug);

  return halaman ? { title: halaman.judul, description: ringkas(halaman.isi, 160) } : { title: "Halaman tidak ditemukan" };
}

export default async function HalamanPage({ params }: PageProps<"/halaman/[slug]">) {
  const halaman = await getHalaman((await params).slug);

  if (!halaman) {
    notFound();
  }

  await prisma.halamanStatis.update({ where: { id: halaman.id }, data: { dibaca: { increment: 1 } } });
  const gambar = mediaUrl("halaman", halaman.gambar);

  return (
    <DenganSidebar>
      <article className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">{halaman.judul}</h1>
        {gambar && <Image src={gambar} alt="" width={1200} height={750} className="my-6 h-auto w-full rounded-sm" />}
        <div className="isi-artikel mt-6" dangerouslySetInnerHTML={{ __html: bersihkanHtml(halaman.isi) }} />
      </article>
    </DenganSidebar>
  );
}
