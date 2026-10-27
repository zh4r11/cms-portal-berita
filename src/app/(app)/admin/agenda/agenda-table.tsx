"use client";

import DataTableCard from "@/components/data-table-card";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import Thumb from "@/components/thumb";
import { formatTanggalSingkat } from "@/lib/format";
import { hapusAgenda } from "./actions";

type Agenda = {
  id: number;
  tema: string;
  tempat: string;
  gambarUrl: string | null;
  tglMulai: Date;
  tglSelesai: Date;
  jam: string;
};

export function AgendaTable({ agenda }: { agenda: Agenda[] }) {
  const { cari, setCari, hasil } = useClientSearch(agenda, (a) => [a.tema, a.tempat]);

  return (
    <>
      <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari tema atau tempat..." />
      <DataTableCard
        rows={hasil}
        rowKey={(a) => a.id}
        emptyText={cari ? `Tidak ada agenda yang cocok dengan "${cari}".` : "Belum ada agenda."}
        columns={[
          { header: "Gambar", cell: (a) => <Thumb src={a.gambarUrl} />, className: "w-20" },
          {
            header: "Tema",
            cell: (a) => (
              <div className="max-w-md min-w-56 whitespace-normal">
                <p className="font-medium">{a.tema}</p>
                <p className="text-xs text-muted-foreground">{a.tempat}</p>
              </div>
            ),
          },
          {
            header: "Waktu",
            cell: (a) => (
              <div className="text-sm">
                <p>
                  {formatTanggalSingkat(a.tglMulai)}
                  {a.tglSelesai.getTime() !== a.tglMulai.getTime() && ` s.d. ${formatTanggalSingkat(a.tglSelesai)}`}
                </p>
                <p className="text-xs text-muted-foreground">{a.jam}</p>
              </div>
            ),
            className: "w-56",
          },
          {
            header: "Aksi",
            cell: (a) => <RowActions editHref={`/admin/agenda/${a.id}/edit`} destroy={() => hapusAgenda(a.id)} deleteTitle={`Hapus agenda ${a.tema}?`} />,
            className: "w-24 text-right",
          },
        ]}
      />
    </>
  );
}
