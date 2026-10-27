"use client";

import { ExternalLink } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Pagination from "@/components/pagination";
import RowActions from "@/components/row-actions";
import Thumb from "@/components/thumb";
import ToggleAktif from "@/components/toggle-aktif";
import { Badge } from "@/components/ui/badge";
import { formatAngka, formatTanggalSingkat } from "@/lib/format";
import type { PageMeta } from "@/lib/pagination";
import { hapusBerita, terbitkanBerita } from "./actions";

type Berita = {
  id: number;
  judul: string;
  slug: string;
  gambarUrl: string | null;
  aktif: boolean;
  headline: boolean;
  utama: boolean;
  dibaca: number;
  publishedAt: Date;
  kategori: { nama: string } | null;
  author: { name: string } | null;
  _count: { komentar: number };
};

export function BeritaTable({ rows, meta, filtered }: { rows: Berita[]; meta: PageMeta; filtered: boolean }) {
  return (
    <>
      <DataTableCard
        rows={rows}
        rowKey={(b) => b.id}
        emptyText={filtered ? "Tidak ada berita yang cocok dengan filter ini." : "Belum ada berita. Mulai dengan tombol Tulis berita."}
        columns={[
          { header: "Foto", cell: (b) => <Thumb src={b.gambarUrl} />, className: "w-20" },
          {
            header: "Judul",
            cell: (b) => (
              <div className="max-w-md min-w-64 space-y-1 whitespace-normal">
                <p className="font-medium">{b.judul}</p>
                <p className="text-xs text-muted-foreground">
                  {b.kategori?.nama ?? "Tanpa kategori"} · {b.author?.name ?? "Penulis dihapus"} · {formatAngka(b.dibaca)} kali dibaca ·{" "}
                  {b._count.komentar} komentar
                </p>
                {(b.headline || b.utama) && (
                  <div className="flex gap-1">
                    {b.headline && <Badge variant="outline">Headline</Badge>}
                    {b.utama && <Badge variant="outline">Pilihan redaksi</Badge>}
                  </div>
                )}
              </div>
            ),
          },
          { header: "Terbit", cell: (b) => formatTanggalSingkat(b.publishedAt), className: "w-32" },
          {
            header: "Status",
            cell: (b) => (
              <div className="flex items-center gap-2">
                <ToggleAktif checked={b.aktif} action={(v) => terbitkanBerita(b.id, v)} label={`Terbitkan ${b.judul}`} />
                <span className="text-xs text-muted-foreground">{b.aktif ? "Terbit" : "Draf"}</span>
              </div>
            ),
            className: "w-28",
          },
          {
            header: "Aksi",
            cell: (b) => (
              <div className="flex items-center justify-end gap-1">
                {b.aktif && (
                  <a
                    href={`/berita/${b.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring pointer-coarse:size-11"
                  >
                    <ExternalLink className="size-4" />
                    <span className="sr-only">Lihat di portal</span>
                  </a>
                )}
                <RowActions
                  editHref={`/admin/berita/${b.id}/edit`}
                  destroy={() => hapusBerita(b.id)}
                  deleteTitle="Hapus berita ini?"
                  deleteDescription={`"${b.judul}" beserta ${b._count.komentar} komentarnya akan dihapus permanen.`}
                />
              </div>
            ),
            className: "w-32 text-right",
          },
        ]}
      />
      <Pagination meta={meta} />
    </>
  );
}
