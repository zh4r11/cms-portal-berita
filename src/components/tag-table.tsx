"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import type { ActionResult } from "@/lib/action";

export type TagRow = { id: number; nama: string; slug: string; jumlah: number };

/** Tabel tag untuk berita (/tag/...) dan video. */
export function TagTable({
  title,
  description,
  satuan,
  prefix,
  tags,
  tambah,
  ubah,
  hapus,
}: {
  title: string;
  description: string;
  satuan: string;
  prefix?: string;
  tags: TagRow[];
  tambah: (data: { nama: string; slug: string }) => Promise<ActionResult>;
  ubah: (id: number, data: { nama: string; slug: string }) => Promise<ActionResult>;
  hapus: (id: number) => Promise<ActionResult>;
}) {
  const { cari, setCari, hasil } = useClientSearch(tags, (t) => [t.nama, t.slug]);
  const crud = useCrudDialog<TagRow, { nama: string; slug: string }>({
    empty: { nama: "", slug: "" },
    toForm: (t) => ({ nama: t.nama, slug: t.slug }),
    store: tambah,
    update: ubah,
  });

  return (
    <>
      <PageHeader title={title} description={description}>
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah tag
        </Button>
      </PageHeader>

      <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari tag..." />

      <DataTableCard
        rows={hasil}
        rowKey={(t) => t.id}
        emptyText={cari ? `Tidak ada tag yang cocok dengan "${cari}".` : "Belum ada tag. Tambahkan lewat tombol Tambah tag."}
        columns={[
          { header: "Nama tag", cell: (t) => <span className="font-medium">{t.nama}</span> },
          {
            header: prefix ? "Alamat" : "Slug",
            cell: (t) => <span className="text-muted-foreground">{prefix ? `${prefix}${t.slug}` : t.slug}</span>,
          },
          { header: satuan, cell: (t) => t.jumlah, className: "w-24 tabular-nums" },
          {
            header: "Aksi",
            cell: (t) => (
              <RowActions
                onEdit={() => crud.openEdit(t)}
                destroy={() => hapus(t.id)}
                deleteTitle={`Hapus tag ${t.nama}?`}
                deleteDescription={`Tag dilepas dari ${t.jumlah} ${satuan.toLowerCase()}.`}
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah tag" : "Tambah tag"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="nama" label="Nama tag" error={crud.form.errors.nama}>
          <Input
            id="nama"
            value={crud.form.data.nama}
            onChange={(e) => crud.form.setData("nama", e.target.value)}
            aria-invalid={!!crud.form.errors.nama}
            autoFocus
          />
        </Field>
        <Field id="slug" label="Slug" error={crud.form.errors.slug} hint="Kosongkan agar dibuat dari nama tag.">
          <Input id="slug" value={crud.form.data.slug} onChange={(e) => crud.form.setData("slug", e.target.value)} />
        </Field>
      </FormDialog>
    </>
  );
}
