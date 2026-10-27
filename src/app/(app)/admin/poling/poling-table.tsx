"use client";

import { Plus, RotateCcw } from "lucide-react";
import ConfirmDelete from "@/components/confirm-delete";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { SimpleSelect } from "@/components/select-field";
import ToggleAktif from "@/components/toggle-aktif";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { formatAngka } from "@/lib/format";
import { aktifkanPoling, hapusPoling, resetSuara, tambahPoling, ubahPoling } from "./actions";

type Poling = { id: number; pilihan: string; status: "pertanyaan" | "jawaban"; rating: number; aktif: boolean };
type Form = { pilihan: string; status: string; aktif: boolean };

export function PolingTable({ poling }: { poling: Poling[] }) {
  const crud = useCrudDialog<Poling, Form>({
    empty: { pilihan: "", status: "jawaban", aktif: true },
    toForm: (p) => ({ pilihan: p.pilihan, status: p.status, aktif: p.aktif }),
    store: tambahPoling,
    update: ubahPoling,
  });
  const totalSuara = poling.filter((p) => p.status === "jawaban" && p.aktif).reduce((sum, p) => sum + p.rating, 0);

  return (
    <>
      <PageHeader
        title="Jajak Pendapat"
        description="Satu pertanyaan aktif dan beberapa jawaban. Pembaca memilih satu jawaban dari sidebar portal."
      >
        <ConfirmDelete
          action={resetSuara}
          title="Kembalikan semua suara ke nol?"
          description={`${formatAngka(totalSuara)} suara yang sudah masuk akan hilang.`}
          confirmLabel="Reset suara"
        >
          <Button variant="outline" disabled={totalSuara === 0}>
            <RotateCcw />
            Reset suara
          </Button>
        </ConfirmDelete>
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah pilihan
        </Button>
      </PageHeader>

      <DataTableCard
        rows={poling}
        rowKey={(p) => p.id}
        emptyText="Belum ada jajak pendapat. Tambahkan satu pertanyaan lalu beberapa jawaban."
        columns={[
          {
            header: "Jenis",
            cell: (p) => <Badge variant={p.status === "pertanyaan" ? "default" : "outline"}>{p.status === "pertanyaan" ? "Pertanyaan" : "Jawaban"}</Badge>,
            className: "w-32",
          },
          { header: "Teks", cell: (p) => <span className={p.status === "pertanyaan" ? "font-medium" : ""}>{p.pilihan}</span> },
          {
            header: "Suara",
            cell: (p) =>
              p.status === "jawaban"
                ? `${formatAngka(p.rating)}${totalSuara && p.aktif ? ` (${Math.round((p.rating / totalSuara) * 100)}%)` : ""}`
                : "",
            className: "w-32 tabular-nums",
          },
          {
            header: "Tampil",
            cell: (p) => <ToggleAktif checked={p.aktif} action={(v) => aktifkanPoling(p.id, v)} label={`Tampilkan ${p.pilihan}`} />,
            className: "w-24",
          },
          {
            header: "Aksi",
            cell: (p) => <RowActions onEdit={() => crud.openEdit(p)} destroy={() => hapusPoling(p.id)} deleteTitle={`Hapus "${p.pilihan}"?`} />,
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah pilihan" : "Tambah pilihan"}
        description="Mengaktifkan sebuah pertanyaan otomatis menyembunyikan pertanyaan lain."
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="status" label="Jenis" error={crud.form.errors.status}>
          <SimpleSelect
            id="status"
            value={crud.form.data.status}
            onChange={(v) => crud.form.setData("status", v)}
            options={[
              { value: "pertanyaan", label: "Pertanyaan" },
              { value: "jawaban", label: "Jawaban" },
            ]}
          />
        </Field>
        <Field id="pilihan" label="Teks" error={crud.form.errors.pilihan}>
          <Input id="pilihan" value={crud.form.data.pilihan} onChange={(e) => crud.form.setData("pilihan", e.target.value)} autoFocus />
        </Field>
        <div className="flex items-center gap-3">
          <Checkbox id="aktif" checked={crud.form.data.aktif} onCheckedChange={(v) => crud.form.setData("aktif", v === true)} />
          <Label htmlFor="aktif">Tampilkan di portal</Label>
        </div>
      </FormDialog>
    </>
  );
}
