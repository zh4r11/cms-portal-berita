import type { Metadata } from "next";
import PageHeader, { PageContainer } from "@/components/page-header";
import { TEMA, temaValid } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { TemplateList } from "./template-list";

export const metadata: Metadata = { title: "Template Warna" };

export default async function TemplatesPage() {
  await requireModul("templates");
  const templates = await prisma.template.findMany({ orderBy: { id: "asc" } });

  return (
    <PageContainer breadcrumbs={[{ title: "Template Warna" }]}>
      <PageHeader
        title="Template Warna"
        description="Pengganti template biru, merah, dan hijau di versi lama. Warna dipakai untuk tombol, tautan, dan aksen di portal dan panel."
      />
      <TemplateList
        templates={templates.map((t) => {
          const tema = TEMA[temaValid(t.folder)];

          return { id: t.id, judul: t.judul, pembuat: t.pembuat, aktif: t.aktif, light: tema.light, dark: tema.dark };
        })}
      />
    </PageContainer>
  );
}
