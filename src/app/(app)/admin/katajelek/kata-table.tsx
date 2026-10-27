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
import { hapusKata, tambahKata, ubahKata } from "./actions";

type Kata = { id: number; kata: string; ganti: string };

export function KataTable({ kata }: { kata: Kata[] }) {
  const crud = useCrudDialog<Kata, { kata: string; ganti: string }>({
    empty: { kata: "", ganti: "" },
    toForm: (k) => ({ kata: k.kata, ganti: k.ganti }),
    store: tambahKata,
    update: ubahKata,
  });

  return (
    <>
      <PageHeader
        title="Sensor Kata"
        description="Kata di komentar berita dan video yang cocok dengan daftar ini diganti otomatis saat ditampilkan."
      >
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah kata
        </Button>
      </PageHeader>

      <DataTableCard
        rows={kata}
        rowKey={(k) => k.id}
        emptyText="Belum ada kata yang disensor."
        columns={[
          { header: "Kata", cell: (k) => <span className="font-medium">{k.kata}</span> },
          { header: "Ditampilkan sebagai", cell: (k) => k.ganti },
          {
            header: "Aksi",
            cell: (k) => (
              <RowActions onEdit={() => crud.openEdit(k)} destroy={() => hapusKata(k.id)} deleteTitle={`Hapus "${k.kata}" dari daftar sensor?`} />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah kata sensor" : "Tambah kata sensor"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="kata" label="Kata" error={crud.form.errors.kata} hint="Dicocokkan sebagai kata utuh, huruf besar/kecil diabaikan.">
          <Input id="kata" value={crud.form.data.kata} onChange={(e) => crud.form.setData("kata", e.target.value)} autoFocus />
        </Field>
        <Field id="ganti" label="Ditampilkan sebagai" error={crud.form.errors.ganti}>
          <Input id="ganti" value={crud.form.data.ganti} onChange={(e) => crud.form.setData("ganti", e.target.value)} placeholder="Mis. b******" />
        </Field>
      </FormDialog>
    </>
  );
}
