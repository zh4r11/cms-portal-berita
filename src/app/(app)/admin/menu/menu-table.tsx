"use client";

import { CornerDownRight, Plus } from "lucide-react";
import Combobox from "@/components/combobox";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { SimpleSelect } from "@/components/select-field";
import ToggleAktif from "@/components/toggle-aktif";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { aktifkanMenu, hapusMenu, tambahMenu, ubahMenu } from "./actions";

type Row = { id: number; nama: string; link: string | null; parentId: number | null; urutan: number; aktif: boolean; anak: number };
type Opsi = { value: string; label: string; group: string };
type Form = { nama: string; parentId: string; jenis: string; link: string; urlLuar: string; urutan: string; aktif: boolean };

const UTAMA = "0";
const LUAR = "__luar__";
const KOSONG = "";

export function MenuTable({ rows, induk, opsi }: { rows: Row[]; induk: { id: number; nama: string }[]; opsi: Opsi[] }) {
  const label = (link: string | null) => {
    if (!link) return "Pembuka submenu";
    return opsi.find((o) => o.value === link)?.label ?? link;
  };

  const crud = useCrudDialog<Row, Form>({
    empty: { nama: "", parentId: UTAMA, jenis: "internal", link: KOSONG, urlLuar: "", urutan: "0", aktif: true },
    toForm: (r) => {
      const luar = !!r.link && /^https?:\/\//.test(r.link);

      return {
        nama: r.nama,
        parentId: r.parentId ? String(r.parentId) : UTAMA,
        jenis: luar ? LUAR : "internal",
        link: luar ? KOSONG : (r.link ?? KOSONG),
        urlLuar: luar ? r.link! : "",
        urutan: String(r.urutan),
        aktif: r.aktif,
      };
    },
    store: (d) => tambahMenu(payload(d)),
    update: (id, d) => ubahMenu(id, payload(d)),
  });

  const { data, setData, errors } = crud.form;

  return (
    <>
      <PageHeader title="Menu Website" description="Navigasi utama portal. Menu utama boleh punya submenu satu tingkat.">
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah menu
        </Button>
      </PageHeader>

      <DataTableCard
        rows={rows}
        rowKey={(r) => r.id}
        emptyText="Belum ada menu. Portal hanya menampilkan tautan Beranda sampai menu ditambahkan."
        columns={[
          {
            header: "Nama",
            cell: (r) =>
              r.parentId ? (
                <span className="flex items-center gap-2 pl-4">
                  <CornerDownRight className="size-4 text-muted-foreground" />
                  {r.nama}
                </span>
              ) : (
                <span className="font-medium">{r.nama}</span>
              ),
          },
          { header: "Tujuan", cell: (r) => <span className="text-muted-foreground">{label(r.link)}</span> },
          { header: "Urutan", cell: (r) => r.urutan, className: "w-20 tabular-nums" },
          {
            header: "Tampil",
            cell: (r) => <ToggleAktif checked={r.aktif} action={(v) => aktifkanMenu(r.id, v)} label={`Tampilkan menu ${r.nama}`} />,
            className: "w-24",
          },
          {
            header: "Aksi",
            cell: (r) => (
              <RowActions
                onEdit={() => crud.openEdit(r)}
                destroy={() => hapusMenu(r.id)}
                deleteTitle={`Hapus menu ${r.nama}?`}
                deleteDescription={r.anak ? `${r.anak} submenu di bawahnya ikut terhapus.` : undefined}
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah menu" : "Tambah menu"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="nama" label="Nama menu" error={errors.nama}>
          <Input id="nama" value={data.nama} onChange={(e) => setData("nama", e.target.value)} autoFocus />
        </Field>
        <Field id="parentId" label="Letak" error={errors.parentId}>
          <SimpleSelect
            id="parentId"
            value={data.parentId}
            onChange={(v) => setData("parentId", v)}
            options={[
              { value: UTAMA, label: "Menu utama" },
              ...induk.filter((m) => m.id !== crud.editing?.id).map((m) => ({ value: String(m.id), label: `Submenu dari ${m.nama}` })),
            ]}
          />
        </Field>
        <Field id="jenis" label="Jenis tujuan">
          <SimpleSelect
            id="jenis"
            value={data.jenis}
            onChange={(v) => setData("jenis", v)}
            options={[
              { value: "internal", label: "Halaman di portal" },
              { value: LUAR, label: "Situs luar (URL)" },
            ]}
          />
        </Field>
        {data.jenis === LUAR ? (
          <Field id="urlLuar" label="URL" error={errors.link}>
            <Input id="urlLuar" value={data.urlLuar} onChange={(e) => setData("urlLuar", e.target.value)} placeholder="https://" />
          </Field>
        ) : (
          <Field id="link" label="Tujuan" error={errors.link} hint={data.parentId === UTAMA ? "Boleh kosong bila menu ini hanya membuka submenu." : undefined}>
            <Combobox
              id="link"
              options={opsi.map((o) => ({ value: o.value, label: o.label, description: o.value, group: o.group }))}
              value={data.link}
              onChange={(v) => setData("link", v)}
              placeholder="Pilih halaman..."
              invalid={!!errors.link}
            />
          </Field>
        )}
        <Field id="urutan" label="Urutan" error={errors.urutan} hint="Angka kecil tampil lebih dulu.">
          <Input id="urutan" type="number" min={0} max={999} value={data.urutan} onChange={(e) => setData("urutan", e.target.value)} />
        </Field>
        <div className="flex items-center gap-3">
          <Checkbox id="aktif" checked={data.aktif} onCheckedChange={(v) => setData("aktif", v === true)} />
          <Label htmlFor="aktif">Tampilkan di portal</Label>
        </div>
      </FormDialog>
    </>
  );
}

function payload(d: Form) {
  return {
    nama: d.nama,
    parentId: d.parentId === UTAMA ? "" : d.parentId,
    link: d.jenis === LUAR ? d.urlLuar.trim() : d.link,
    urutan: d.urutan,
    aktif: d.aktif,
  };
}
