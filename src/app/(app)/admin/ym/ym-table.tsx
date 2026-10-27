"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { hapusYm, tambahYm, ubahYm } from "./actions";

type Kontak = { id: number; nama: string; username: string };

export function YmTable({ kontak }: { kontak: Kontak[] }) {
  const crud = useCrudDialog<Kontak, { nama: string; username: string }>({
    empty: { nama: "", username: "" },
    toForm: (k) => ({ nama: k.nama, username: k.username }),
    store: tambahYm,
    update: ubahYm,
  });

  return (
    <>
      <PageHeader
        title="Kontak YM"
        description="Yahoo! Messenger sudah ditutup sejak 2018. Kontak ini hanya tampil sebagai teks di halaman Hubungi Kami, tanpa tombol chat."
      >
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah kontak
        </Button>
      </PageHeader>

      <DataTableCard
        rows={kontak}
        rowKey={(k) => k.id}
        emptyText="Belum ada kontak."
        columns={[
          { header: "Nama", cell: (k) => <span className="font-medium">{k.nama}</span> },
          { header: "ID Yahoo!", cell: (k) => k.username },
          {
            header: "Aksi",
            cell: (k) => <RowActions onEdit={() => crud.openEdit(k)} destroy={() => hapusYm(k.id)} deleteTitle={`Hapus kontak ${k.nama}?`} />,
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah kontak" : "Tambah kontak"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="nama" label="Nama" error={crud.form.errors.nama}>
          <Input id="nama" value={crud.form.data.nama} onChange={(e) => crud.form.setData("nama", e.target.value)} autoFocus />
        </Field>
        <Field id="username" label="ID Yahoo!" error={crud.form.errors.username}>
          <Input id="username" value={crud.form.data.username} onChange={(e) => crud.form.setData("username", e.target.value)} />
        </Field>
      </FormDialog>
    </>
  );
}
