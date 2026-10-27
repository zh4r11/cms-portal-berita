import { Images } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Galeri foto" };

export default async function GaleriPage() {
  const album = await prisma.album.findMany({
    where: { aktif: true, galeri: { some: {} } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { galeri: true } }, galeri: { take: 1, orderBy: { id: "asc" }, select: { gambar: true } } },
  });

  return (
    <>
      <JudulBagian as="h1">Berita Foto</JudulBagian>
      {album.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          <Images className="size-8" />
          <p>Belum ada album foto.</p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {album.map((a) => {
            const sampul = mediaUrl("album", a.gambar) ?? mediaUrl("galeri", a.galeri[0]?.gambar);

            return (
              <li key={a.id}>
                <Link href={`/galeri/${a.slug}`} className="group block space-y-2 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring">
                  {sampul && <Image src={sampul} alt="" width={480} height={320} className="aspect-[3/2] w-full rounded-sm object-cover" />}
                  <h2 className="font-serif text-lg leading-snug font-semibold group-hover:underline">{a.judul}</h2>
                  <p className="text-xs text-muted-foreground">{a._count.galeri} foto</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
