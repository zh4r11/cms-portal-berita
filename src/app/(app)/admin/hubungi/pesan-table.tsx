"use client";

import { Mail, MailOpen, Reply } from "lucide-react";
import { useState } from "react";
import DataTableCard from "@/components/data-table-card";
import Pagination from "@/components/pagination";
import RowActions from "@/components/row-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAction } from "@/hooks/use-form";
import { formatWaktu } from "@/lib/format";
import type { PageMeta } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { hapusPesan, tandaiPesan } from "./actions";

type Pesan = { id: number; nama: string; email: string; subjek: string; pesan: string; dibaca: boolean; createdAt: Date };

export function PesanTable({ pesan, meta, cari }: { pesan: Pesan[]; meta: PageMeta; cari: string }) {
  const [buka, setBuka] = useState<Pesan | null>(null);
  const [, run] = useAction();

  const lihat = (p: Pesan) => {
    setBuka(p);

    if (!p.dibaca) {
      run(() => tandaiPesan(p.id, true));
    }
  };

  return (
    <>
      <DataTableCard
        rows={pesan}
        rowKey={(p) => p.id}
        emptyText={cari ? `Tidak ada pesan yang cocok dengan "${cari}".` : "Belum ada pesan dari pembaca."}
        columns={[
          {
            header: "Pengirim",
            cell: (p) => (
              <div className="min-w-40">
                <p className={cn(!p.dibaca && "font-semibold")}>{p.nama}</p>
                <p className="text-xs text-muted-foreground">{p.email}</p>
              </div>
            ),
          },
          {
            header: "Subjek",
            cell: (p) => (
              <button
                type="button"
                onClick={() => lihat(p)}
                className="flex max-w-md min-w-56 items-start gap-2 rounded-sm text-left whitespace-normal outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
              >
                {p.dibaca ? (
                  <MailOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-label="Sudah dibaca" />
                ) : (
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Belum dibaca" />
                )}
                <span className={cn(!p.dibaca && "font-semibold")}>{p.subjek}</span>
              </button>
            ),
          },
          { header: "Diterima", cell: (p) => formatWaktu(p.createdAt), className: "w-48" },
          {
            header: "Aksi",
            cell: (p) => <RowActions destroy={() => hapusPesan(p.id)} deleteTitle={`Hapus pesan dari ${p.nama}?`} />,
            className: "w-16 text-right",
          },
        ]}
      />
      <Pagination meta={meta} />

      <Dialog open={!!buka} onOpenChange={(open) => !open && setBuka(null)}>
        <DialogContent className="sm:max-w-xl">
          {buka && (
            <>
              <DialogHeader>
                <DialogTitle>{buka.subjek}</DialogTitle>
                <DialogDescription>
                  {buka.nama} &lt;{buka.email}&gt; · {formatWaktu(buka.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <p className="max-h-[50vh] overflow-y-auto text-sm whitespace-pre-line">{buka.pesan}</p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    run(() => tandaiPesan(buka.id, false));
                    setBuka(null);
                  }}
                >
                  Tandai belum dibaca
                </Button>
                <Button asChild>
                  <a href={`mailto:${buka.email}?subject=${encodeURIComponent(`Re: ${buka.subjek}`)}`}>
                    <Reply />
                    Balas lewat email
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
