import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { Galeri } from "./galeri";

const getAlbum = cache(async (slug: string) =>
  prisma.album.findFirst({ where: { slug, aktif: true }, include: { galeri: { orderBy: { id: "asc" } } } }),
);

export async function generateMetadata({ params }: PageProps<"/galeri/[slug]">): Promise<Metadata> {
  const album = await getAlbum((await params).slug);

  return { title: album?.judul ?? "Album tidak ditemukan" };
}

export default async function AlbumPage({ params }: PageProps<"/galeri/[slug]">) {
  const album = await getAlbum((await params).slug);

  if (!album) {
    notFound();
  }

  await prisma.album.update({ where: { id: album.id }, data: { dilihat: { increment: 1 } } });

  return (
    <>
      <JudulBagian as="h1" href="/galeri" hrefLabel="Semua album">
        {album.judul}
      </JudulBagian>
      {album.keterangan && <p className="mb-6 max-w-2xl text-muted-foreground">{album.keterangan}</p>}
      {album.galeri.length === 0 ? (
        <p className="text-sm text-muted-foreground">Album ini belum berisi foto.</p>
      ) : (
        <Galeri foto={album.galeri.map((f) => ({ id: f.id, judul: f.judul, keterangan: f.keterangan, src: mediaUrl("galeri", f.gambar)! }))} />
      )}
    </>
  );
}
