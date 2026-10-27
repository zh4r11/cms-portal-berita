import type { Metadata } from "next";
import PageHeader, { PageContainer } from "@/components/page-header";
import { mediaUrl } from "@/lib/media";
import { requireModul } from "@/lib/session";
import { getIdentitas } from "@/lib/site";
import { IdentitasForm } from "./identitas-form";

export const metadata: Metadata = { title: "Identitas Website" };

export default async function IdentitasPage() {
  await requireModul("identitas");
  const i = await getIdentitas();

  return (
    <PageContainer breadcrumbs={[{ title: "Identitas Website" }]}>
      <PageHeader title="Identitas Website" description="Nama, kontak, dan data SEO yang dipakai di seluruh portal." />
      <IdentitasForm
        faviconUrl={mediaUrl("favicon", i.favicon)}
        initial={{
          namaWebsite: i.namaWebsite,
          email: i.email ?? "",
          url: i.url ?? "",
          facebook: i.facebook ?? "",
          rekening: i.rekening ?? "",
          noTelp: i.noTelp ?? "",
          metaDeskripsi: i.metaDeskripsi ?? "",
          metaKeyword: i.metaKeyword ?? "",
          favicon: null,
          hapusFavicon: false,
        }}
      />
    </PageContainer>
  );
}
