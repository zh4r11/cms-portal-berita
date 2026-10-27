import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { opsiLinkMenu } from "@/lib/menu-link";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { MenuTable } from "./menu-table";

export const metadata: Metadata = { title: "Menu Website" };

export default async function MenuPage() {
  await requireModul("menu");
  const [menu, opsi] = await Promise.all([
    prisma.menu.findMany({ where: { parentId: null }, orderBy: [{ urutan: "asc" }, { id: "asc" }], include: { children: { orderBy: [{ urutan: "asc" }, { id: "asc" }] } } }),
    opsiLinkMenu(),
  ]);

  // Baris tabel: menu utama diikuti submenunya.
  const rows = menu.flatMap((m) => [
    { id: m.id, nama: m.nama, link: m.link, parentId: null, urutan: m.urutan, aktif: m.aktif, anak: m.children.length },
    ...m.children.map((c) => ({ id: c.id, nama: c.nama, link: c.link, parentId: m.id, urutan: c.urutan, aktif: c.aktif, anak: 0 })),
  ]);

  return (
    <PageContainer breadcrumbs={[{ title: "Menu Website" }]}>
      <MenuTable rows={rows} induk={menu.map((m) => ({ id: m.id, nama: m.nama }))} opsi={opsi} />
    </PageContainer>
  );
}
