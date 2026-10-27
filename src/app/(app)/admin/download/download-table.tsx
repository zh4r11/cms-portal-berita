"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import ImageInput from "@/components/image-input";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { formatAngka, formatTanggalSingkat } from "@/lib/format";
import { hapusDownload, tambahDownload, ubahDownload } from "./actions";

type Download = { id: number; judul: string; namaFile: string; hits: number; createdAt: Date };
type Form = { judul: string; file: File | null };

export function DownloadTable({ download }: { download: Download[] }) {
  const crud = useCrudDialog<Download, Form>({
    empty: { judul: "", file: null },
    toForm: (d) => ({ judul: d.judul, file: null }),
    store: tambahDownload,
    update: ubahDownload,
  });

  return (
    <>
      <PageHeader title="Download" description="Berkas yang bisa diunduh pembaca dari halaman Download.">
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah file
        </Button>
      </PageHeader>

      <DataTableCard
        rows={download}
        rowKey={(d) => d.id}
        emptyText="Belum ada file untuk diunduh."
        columns={[
          { header: "Judul", cell: (d) => <span className="font-medium">{d.judul}</span> },
          {
            header: "File",
            cell: (d) => (
              <TextLink href={`/media/download/${encodeURIComponent(d.namaFile)}`} target="_blank" className="text-muted-foreground">
                {d.namaFile}
              </TextLink>
            ),
          },
          { header: "Diunduh", cell: (d) => `${formatAngka(d.hits)} kali`, className: "w-28 tabular-nums" },
          { header: "Diunggah", cell: (d) => formatTanggalSingkat(d.createdAt), className: "w-32" },
          {
            header: "Aksi",
            cell: (d) => <RowActions onEdit={() => crud.openEdit(d)} destroy={() => hapusDownload(d.id)} deleteTitle={`Hapus ${d.judul}?`} />,
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah file download" : "Tambah file download"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="judul" label="Judul" error={crud.form.errors.judul}>
          <Input id="judul" value={crud.form.data.judul} onChange={(e) => crud.form.setData("judul", e.target.value)} autoFocus />
        </Field>
        <ImageInput
          id="file"
          jenis="berkas"
          label="File"
          value={crud.form.data.file}
          onChange={(file) => crud.form.setData("file", file)}
          currentName={crud.editing?.namaFile}
          error={crud.form.errors.file}
        />
      </FormDialog>
    </>
  );
}
