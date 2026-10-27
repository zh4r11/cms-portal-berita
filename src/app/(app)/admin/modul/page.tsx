import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { MODUL, isModulKey } from "@/lib/modul";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { ModulTable } from "./modul-table";

export const metadata: Metadata = { title: "Manajemen Modul" };

export default async function ModulPage() {
  await requireModul("modul");
  const modul = await prisma.modul.findMany({ orderBy: [{ urutan: "asc" }, { id: "asc" }], include: { _count: { select: { users: true } } } });

  return (
    <PageContainer breadcrumbs={[{ title: "Manajemen Modul" }]}>
      <ModulTable
        modul={modul
          .filter((m) => isModulKey(m.link))
          .map((m) => ({
            id: m.id,
            nama: m.nama,
            link: m.link,
            grup: MODUL[m.link as keyof typeof MODUL].grup,
            status: m.status,
            urutan: m.urutan,
            aktif: m.aktif,
            pengguna: m._count.users,
          }))}
      />
    </PageContainer>
  );
}
