"use client";

import { ExternalLink } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import Pagination from "@/components/pagination";
import RowActions from "@/components/row-actions";
import ToggleAktif from "@/components/toggle-aktif";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import type { ActionResult } from "@/lib/action";
import { formatWaktu } from "@/lib/format";
import type { PageMeta } from "@/lib/pagination";

export type KomentarRow = {
  id: number;
  nama: string;
  email?: string | null;
  url: string | null;
  isi: string;
  aktif: boolean;
  createdAt: Date;
  /** Judul berita/video dan tautannya di portal. */
  sumber: { judul: string; href: string };
};

type Form = { nama: string; url: string; isi: string };

/** Moderasi komentar berita dan komentar video. */
export function KomentarTable({
  rows,
  meta,
  cari,
  ubah,
  aktifkan,
  hapus,
}: {
  rows: KomentarRow[];
  meta: PageMeta;
  cari: string;
  ubah: (id: number, data: Form) => Promise<ActionResult>;
  aktifkan: (id: number, aktif: boolean) => Promise<ActionResult>;
  hapus: (id: number) => Promise<ActionResult>;
}) {
  const crud = useCrudDialog<KomentarRow, Form>({
    empty: { nama: "", url: "", isi: "" },
    toForm: (k) => ({ nama: k.nama, url: k.url ?? "", isi: k.isi }),
    store: async () => ({ ok: false, message: "Komentar hanya bisa ditulis pembaca dari portal." }),
    update: ubah,
  });

  return (
    <>
      <DataTableCard
        rows={rows}
        rowKey={(k) => k.id}
        emptyText={cari ? `Tidak ada komentar yang cocok dengan "${cari}".` : "Belum ada komentar dari pembaca."}
        columns={[
          {
            header: "Pengirim",
            cell: (k) => (
              <div className="min-w-36">
                <p className="font-medium">{k.nama}</p>
                {k.email && <p className="text-xs text-muted-foreground">{k.email}</p>}
                <p className="text-xs text-muted-foreground">{formatWaktu(k.createdAt)}</p>
              </div>
            ),
          },
          {
            header: "Komentar",
            cell: (k) => (
              <div className="max-w-md min-w-60 space-y-1 whitespace-normal">
                <p className="line-clamp-3">{k.isi}</p>
                <a
                  href={k.sumber.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  pada: {k.sumber.judul}
                  <ExternalLink className="size-3" />
                </a>
              </div>
            ),
          },
          {
            header: "Tampil",
            cell: (k) => <ToggleAktif checked={k.aktif} action={(v) => aktifkan(k.id, v)} label={`Tampilkan komentar ${k.nama}`} />,
            className: "w-24",
          },
          {
            header: "Aksi",
            cell: (k) => <RowActions onEdit={() => crud.openEdit(k)} destroy={() => hapus(k.id)} deleteTitle={`Hapus komentar dari ${k.nama}?`} />,
            className: "w-24 text-right",
          },
        ]}
      />

      <Pagination meta={meta} />

      <FormDialog open={crud.open} onOpenChange={crud.setOpen} title="Ubah komentar" processing={crud.form.processing} onSubmit={crud.submit}>
        <Field id="nama" label="Nama" error={crud.form.errors.nama}>
          <Input id="nama" value={crud.form.data.nama} onChange={(e) => crud.form.setData("nama", e.target.value)} />
        </Field>
        <Field id="url" label="Situs web" error={crud.form.errors.url}>
          <Input id="url" value={crud.form.data.url} onChange={(e) => crud.form.setData("url", e.target.value)} placeholder="https://" />
        </Field>
        <Field id="isi" label="Komentar" error={crud.form.errors.isi}>
          <Textarea id="isi" rows={5} value={crud.form.data.isi} onChange={(e) => crud.form.setData("isi", e.target.value)} />
        </Field>
      </FormDialog>
    </>
  );
}
