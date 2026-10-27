"use client";

import DataTableCard from "@/components/data-table-card";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import TextLink from "@/components/text-link";
import { formatAngka, formatTanggalSingkat } from "@/lib/format";
import { hapusHalaman } from "./actions";

type Halaman = { id: number; judul: string; slug: string; dibaca: number; createdAt: Date };

export function HalamanTable({ halaman }: { halaman: Halaman[] }) {
  const { cari, setCari, hasil } = useClientSearch(halaman, (h) => [h.judul]);

  return (
    <>
      <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari judul halaman..." />
      <DataTableCard
        rows={hasil}
        rowKey={(h) => h.id}
        emptyText={cari ? `Tidak ada halaman yang cocok dengan "${cari}".` : "Belum ada halaman statis."}
        columns={[
          { header: "Judul", cell: (h) => <span className="font-medium">{h.judul}</span> },
          {
            header: "Alamat",
            cell: (h) => (
              <TextLink href={`/halaman/${h.slug}`} target="_blank" className="text-muted-foreground">
                /halaman/{h.slug}
              </TextLink>
            ),
          },
          { header: "Dibaca", cell: (h) => formatAngka(h.dibaca), className: "w-24 tabular-nums" },
          { header: "Dibuat", cell: (h) => formatTanggalSingkat(h.createdAt), className: "w-32" },
          {
            header: "Aksi",
            cell: (h) => (
              <RowActions
                editHref={`/admin/halaman/${h.id}/edit`}
                destroy={() => hapusHalaman(h.id)}
                deleteTitle={`Hapus halaman ${h.judul}?`}
                deleteDescription="Menu yang menautkan halaman ini akan dinonaktifkan."
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />
    </>
  );
}
