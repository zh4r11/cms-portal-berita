import type { Metadata } from "next";
import { forbidden, notFound } from "next/navigation";
import PageHeader, { PageContainer } from "@/components/page-header";
import { toDatetimeLocal } from "@/lib/dates";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { BeritaForm } from "../../berita-form";

export const metadata: Metadata = { title: "Ubah berita" };

export default async function EditBeritaPage({ params }: PageProps<"/admin/berita/[id]/edit">) {
  const user = await requireModul("berita");
  const id = Number((await params).id);
  const berita = Number.isInteger(id) ? await prisma.berita.findUnique({ where: { id }, include: { tags: true } }) : null;

  if (!berita) {
    notFound();
  }

  if (user.level !== "admin" && berita.authorId !== user.id) {
    forbidden();
  }

  const [kategori, tags] = await Promise.all([
    // Kategori nonaktif tetap muncul bila sudah dipakai berita ini.
    prisma.kategori.findMany({
      where: { OR: [{ aktif: true }, ...(berita.kategoriId ? [{ id: berita.kategoriId }] : [])] },
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    }),
    prisma.tag.findMany({ orderBy: { nama: "asc" }, select: { nama: true } }),
  ]);

  return (
    <PageContainer breadcrumbs={[{ title: "Berita", href: "/admin/berita" }, { title: "Ubah berita" }]}>
      <PageHeader title="Ubah berita" description={berita.aktif ? "Berita ini sudah terbit." : "Berita ini masih draf."} />
      <BeritaForm
        id={berita.id}
        kategori={kategori}
        tags={tags.map((t) => t.nama)}
        gambarUrl={mediaUrl("berita", berita.gambar)}
        initial={{
          judul: berita.judul,
          subJudul: berita.subJudul ?? "",
          slug: berita.slug,
          kategoriId: berita.kategoriId ? String(berita.kategoriId) : "",
          isi: berita.isi,
          youtube: berita.youtube ?? "",
          keteranganGambar: berita.keteranganGambar ?? "",
          tags: berita.tags.map((t) => t.nama),
          headline: berita.headline,
          utama: berita.utama,
          aktif: berita.aktif,
          publishedAt: toDatetimeLocal(berita.publishedAt),
          gambar: null,
          hapusGambar: false,
        }}
      />
    </PageContainer>
  );
}
