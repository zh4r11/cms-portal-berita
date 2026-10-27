import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { MemberTable } from "./member-table";

export const metadata: Metadata = { title: "Member" };

export default async function MemberPage() {
  await requireModul("member");
  const member = await prisma.member.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true, email: true, username: true, createdAt: true },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Member" }]}>
      <MemberTable member={member} />
    </PageContainer>
  );
}
