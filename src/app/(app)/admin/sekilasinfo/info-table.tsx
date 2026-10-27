"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import ImageInput from "@/components/image-input";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import Thumb from "@/components/thumb";
import ToggleAktif from "@/components/toggle-aktif";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { formatTanggalSingkat } from "@/lib/format";
import { aktifkanInfo, hapusInfo, tambahInfo, ubahInfo } from "./actions";

type Info = { id: number; info: string; aktif: boolean; gambarUrl: string | null; createdAt: Date };
type Form = { info: string; aktif: boolean; gambar: File | null; hapusGambar: boolean };

export function InfoTable({ info }: { info: Info[] }) {
  const crud = useCrudDialog<Info, Form>({
    empty: { info: "", aktif: true, gambar: null, hapusGambar: false },
    toForm: (i) => ({ info: i.info, aktif: i.aktif, gambar: null, hapusGambar: false }),
    store: tambahInfo,
    update: ubahInfo,
  });

  return (
    <>
      <PageHeader title="Sekilas Info" description="Kalimat singkat yang tampil di bawah menu portal.">
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah info
        </Button>
      </PageHeader>

      <DataTableCard
        rows={info}
        rowKey={(i) => i.id}
        emptyText="Belum ada sekilas info."
        columns={[
          { header: "Gambar", cell: (i) => <Thumb src={i.gambarUrl} />, className: "w-20" },
          { header: "Info", cell: (i) => <span className="line-clamp-2 min-w-60 whitespace-normal">{i.info}</span> },
          { header: "Tanggal", cell: (i) => formatTanggalSingkat(i.createdAt), className: "w-32" },
          {
            header: "Tampil",
            cell: (i) => <ToggleAktif checked={i.aktif} action={(v) => aktifkanInfo(i.id, v)} label="Tampilkan info" />,
            className: "w-24",
          },
          {
            header: "Aksi",
            cell: (i) => <RowActions onEdit={() => crud.openEdit(i)} destroy={() => hapusInfo(i.id)} deleteTitle="Hapus sekilas info ini?" />,
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah sekilas info" : "Tambah sekilas info"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="info" label="Info" error={crud.form.errors.info}>
          <Textarea id="info" value={crud.form.data.info} onChange={(e) => crud.form.setData("info", e.target.value)} maxLength={200} autoFocus />
        </Field>
        <ImageInput
          id="gambar"
          label="Gambar (opsional)"
          value={crud.form.data.gambar}
          onChange={(file) => crud.form.setData((d) => ({ ...d, gambar: file, hapusGambar: false }))}
          current={crud.editing?.gambarUrl}
          removed={crud.form.data.hapusGambar}
          onRemove={() => crud.form.setData("hapusGambar", true)}
          error={crud.form.errors.gambar}
        />
        <div className="flex items-center gap-3">
          <Checkbox id="aktif" checked={crud.form.data.aktif} onCheckedChange={(v) => crud.form.setData("aktif", v === true)} />
          <Label htmlFor="aktif">Tampilkan di portal</Label>
        </div>
      </FormDialog>
    </>
  );
}
