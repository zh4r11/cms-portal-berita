import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { opsiLinkMenu } from "@/lib/menu-link";
import { prisma } from "@/lib/prisma";

/** Berita yang boleh tampil di portal: sudah terbit dan tanggal terbitnya sudah lewat. */
export function beritaTerbit(): Prisma.BeritaWhereInput {
  return { aktif: true, publishedAt: { lte: new Date() } };
}

export const kartuBerita = {
  id: true,
  judul: true,
  subJudul: true,
  slug: true,
  gambar: true,
  isi: true,
  publishedAt: true,
  dibaca: true,
  kategori: { select: { nama: true, slug: true } },
} satisfies Prisma.BeritaSelect;

export type KartuBerita = Prisma.BeritaGetPayload<{ select: typeof kartuBerita }>;

export type MenuPortal = { id: number; nama: string; link: string | null; children: { id: number; nama: string; link: string }[] };

export const getMenu = cache(async (): Promise<MenuPortal[]> => {
  const [menu, opsi] = await Promise.all([
    prisma.menu.findMany({
      where: { aktif: true, parentId: null },
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
      include: { children: { where: { aktif: true, link: { not: null } }, orderBy: [{ urutan: "asc" }, { id: "asc" }] } },
    }),
    opsiLinkMenu(),
  ]);
  // Tujuan yang sudah dihapus (kategori, halaman, playlist) tidak ditampilkan agar tidak jadi tautan mati.
  const ada = new Set(opsi.map((o) => o.value));
  const valid = (link: string | null) => !!link && (/^https?:\/\//.test(link) || ada.has(link));

  return menu
    .map((m) => ({
      id: m.id,
      nama: m.nama,
      link: valid(m.link) ? m.link : null,
      children: m.children.filter((c) => valid(c.link)).map((c) => ({ id: c.id, nama: c.nama, link: c.link! })),
    }))
    .filter((m) => m.link || m.children.length > 0);
});

/** Bagian tampilan situs yang dipakai di setiap halaman publik. */
export const getTampilan = cache(async () => {
  const [logo, background, header, iklanAtas, sekilas, alamat] = await Promise.all([
    prisma.logo.findFirst({ orderBy: { id: "desc" } }),
    prisma.background.findFirst({ orderBy: { id: "desc" } }),
    prisma.header.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.iklanAtas.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.sekilasInfo.findMany({ where: { aktif: true }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.modAlamat.findFirst({ orderBy: { id: "asc" } }),
  ]);

  return { logo, background, header, iklanAtas, sekilas, alamat };
});
