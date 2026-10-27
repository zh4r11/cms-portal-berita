"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import ImageInput from "@/components/image-input";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import Thumb from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { formatTanggalSingkat } from "@/lib/format";
import { hapusIklan, tambahIklan, ubahIklan } from "./actions";
import type { JenisIklan } from "./jenis";

type Iklan = { id: number; judul: string; url: string | null; gambarUrl: string; createdAt: Date };
type Form = { judul: string; url: string; gambar: File | null };

export function IklanTable({
  jenis,
  title,
  description,
  ukuran,
  rows,
}: {
  jenis: JenisIklan;
  title: string;
  description: string;
  ukuran: string;
  rows: Iklan[];
}) {
  const crud = useCrudDialog<Iklan, Form>({
    empty: { judul: "", url: "", gambar: null },
    toForm: (r) => ({ judul: r.judul, url: r.url ?? "", gambar: null }),
    store: (data) => tambahIklan(jenis, data),
    update: (id, data) => ubahIklan(jenis, id, data),
  });

  return (
    <>
      <PageHeader title={title} description={description}>
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah
        </Button>
      </PageHeader>

      <DataTableCard
        rows={rows}
        rowKey={(r) => r.id}
        emptyText="Belum ada gambar. Bagian ini tidak tampil di portal sampai ada isinya."
        columns={[
          { header: "Gambar", cell: (r) => <Thumb src={r.gambarUrl} alt={r.judul} className="h-12 w-24" />, className: "w-28" },
          { header: "Judul", cell: (r) => <span className="font-medium">{r.judul}</span> },
          { header: "Tautan", cell: (r) => <span className="text-muted-foreground">{r.url ?? "Tanpa tautan"}</span> },
          { header: "Ditambahkan", cell: (r) => formatTanggalSingkat(r.createdAt), className: "w-32" },
          {
            header: "Aksi",
            cell: (r) => <RowActions onEdit={() => crud.openEdit(r)} destroy={() => hapusIklan(jenis, r.id)} deleteTitle={`Hapus ${r.judul}?`} />,
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? `Ubah ${title}` : `Tambah ${title}`}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="judul" label="Judul" error={crud.form.errors.judul} hint="Dipakai sebagai teks alternatif gambar.">
          <Input id="judul" value={crud.form.data.judul} onChange={(e) => crud.form.setData("judul", e.target.value)} autoFocus />
        </Field>
        <Field id="url" label="Tautan (opsional)" error={crud.form.errors.url}>
          <Input id="url" value={crud.form.data.url} onChange={(e) => crud.form.setData("url", e.target.value)} placeholder="https://" />
        </Field>
        <ImageInput
          id="gambar"
          label={`Gambar (${ukuran})`}
          value={crud.form.data.gambar}
          onChange={(file) => crud.form.setData("gambar", file)}
          current={crud.editing?.gambarUrl}
          error={crud.form.errors.gambar}
        />
      </FormDialog>
    </>
  );
}
