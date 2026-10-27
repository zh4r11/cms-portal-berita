"use client";

import DataTableCard from "@/components/data-table-card";
import Pagination from "@/components/pagination";
import RowActions from "@/components/row-actions";
import Thumb from "@/components/thumb";
import { formatAngka, formatTanggalSingkat } from "@/lib/format";
import type { PageMeta } from "@/lib/pagination";
import { hapusVideo } from "./actions";

type Video = {
  id: number;
  judul: string;
  slug: string;
  playlist: string | null;
  sumber: string;
  dilihat: number;
  komentar: number;
  publishedAt: Date;
  gambarUrl: string | null;
};

export function VideoTable({ rows, meta, filtered }: { rows: Video[]; meta: PageMeta; filtered: boolean }) {
  return (
    <>
      <DataTableCard
        rows={rows}
        rowKey={(v) => v.id}
        emptyText={filtered ? "Tidak ada video yang cocok dengan filter ini." : "Belum ada video."}
        columns={[
          { header: "Thumbnail", cell: (v) => <Thumb src={v.gambarUrl} />, className: "w-24" },
          {
            header: "Judul",
            cell: (v) => (
              <div className="max-w-md min-w-56 whitespace-normal">
                <p className="font-medium">{v.judul}</p>
                <p className="text-xs text-muted-foreground">
                  {v.playlist ?? "Tanpa playlist"} · {v.sumber} · {formatAngka(v.dilihat)} kali ditonton · {v.komentar} komentar
                </p>
              </div>
            ),
          },
          { header: "Tanggal", cell: (v) => formatTanggalSingkat(v.publishedAt), className: "w-32" },
          {
            header: "Aksi",
            cell: (v) => (
              <RowActions
                editHref={`/admin/video/${v.id}/edit`}
                destroy={() => hapusVideo(v.id)}
                deleteTitle={`Hapus video ${v.judul}?`}
                deleteDescription="File video dan komentarnya ikut dihapus."
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />
      <Pagination meta={meta} />
    </>
  );
}
