import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { UsersTable } from "./users-table";

export const metadata: Metadata = { title: "Manajemen User" };

export default async function UsersPage() {
  const saya = await requireModul("users");
  const [users, modul] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ level: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        noTelp: true,
        image: true,
        level: true,
        blokir: true,
        modul: { select: { modulId: true } },
        _count: { select: { berita: true } },
      },
    }),
    prisma.modul.findMany({ where: { status: "user" }, orderBy: [{ urutan: "asc" }, { id: "asc" }], select: { id: true, nama: true, aktif: true } }),
  ]);

  return (
    <PageContainer breadcrumbs={[{ title: "Manajemen User" }]}>
      <UsersTable
        sayaId={saya.id}
        users={users.map((u) => ({ ...u, modul: u.modul.map((m) => m.modulId) }))}
        modul={modul}
      />
    </PageContainer>
  );
}
