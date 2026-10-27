import type { Metadata } from "next";
import { CariForm } from "@/components/portal/portal-nav";
import { DaftarBerita } from "@/components/portal/daftar-berita";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { param, parsePage } from "@/lib/pagination";

export const metadata: Metadata = { title: "Cari berita" };

export default async function CariPage({ searchParams }: PageProps<"/cari">) {
  const query = await searchParams;
  const q = param(query.q).slice(0, 100);

  return (
    <DenganSidebar>
      <JudulBagian as="h1">{q ? `Hasil pencarian "${q}"` : "Cari berita"}</JudulBagian>
      <div className="mb-6 max-w-md">
        <CariForm key={q} defaultValue={q} />
      </div>
      {q ? (
        <DaftarBerita
          where={{ OR: [{ judul: { contains: q, mode: "insensitive" } }, { isi: { contains: q, mode: "insensitive" } }] }}
          page={parsePage(query.page)}
          kosong={`Tidak ada berita yang memuat "${q}". Coba kata lain yang lebih umum.`}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Ketik kata kunci untuk mencari judul dan isi berita.</p>
      )}
    </DenganSidebar>
  );
}
