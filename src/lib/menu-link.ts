import "server-only";
import { prisma } from "@/lib/prisma";

export type LinkOption = { value: string; label: string; group: string };

/** Halaman portal yang selalu ada. */
const TETAP: LinkOption[] = [
  { value: "/", label: "Beranda", group: "Halaman portal" },
  { value: "/berita", label: "Indeks berita", group: "Halaman portal" },
  { value: "/agenda", label: "Agenda", group: "Halaman portal" },
  { value: "/galeri", label: "Galeri foto", group: "Halaman portal" },
  { value: "/video", label: "Video", group: "Halaman portal" },
  { value: "/poling", label: "Jajak pendapat", group: "Halaman portal" },
  { value: "/download", label: "Download", group: "Halaman portal" },
  { value: "/hubungi", label: "Hubungi kami", group: "Halaman portal" },
];

/** Semua tujuan yang boleh dipasang di menu: halaman tetap, kategori, halaman statis, playlist. */
export async function opsiLinkMenu(): Promise<LinkOption[]> {
  const [kategori, halaman, playlist] = await Promise.all([
    prisma.kategori.findMany({ orderBy: { nama: "asc" }, select: { nama: true, slug: true } }),
    prisma.halamanStatis.findMany({ orderBy: { judul: "asc" }, select: { judul: true, slug: true } }),
    prisma.playlist.findMany({ where: { aktif: true }, orderBy: { judul: "asc" }, select: { judul: true, slug: true } }),
  ]);

  return [
    ...TETAP,
    ...kategori.map((k) => ({ value: `/kategori/${k.slug}`, label: k.nama, group: "Kategori berita" })),
    ...halaman.map((h) => ({ value: `/halaman/${h.slug}`, label: h.judul, group: "Halaman statis" })),
    ...playlist.map((p) => ({ value: `/video/playlist/${p.slug}`, label: p.judul, group: "Playlist video" })),
  ];
}

/** Link valid bila tujuannya ada di portal atau berupa URL luar. */
export async function linkValid(link: string): Promise<boolean> {
  if (/^https?:\/\/\S+$/.test(link)) {
    return true;
  }

  return (await opsiLinkMenu()).some((o) => o.value === link);
}
