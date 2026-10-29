"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import ToggleAktif from "@/components/toggle-aktif";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { gayaKategori, WARNA_KATEGORI, WARNA_KATEGORI_KEYS, type WarnaKategoriKey } from "@/lib/cms";
import { aktifkanKategori, hapusKategori, tambahKategori, ubahKategori } from "./actions";

type Kategori = { id: number; nama: string; slug: string; warna: string | null; aktif: boolean; _count: { berita: number } };

/** Nilai pilihan "ikuti warna template"; Select Radix tidak menerima value kosong. */
const TANPA_WARNA = "template";

function Swatch({ warna }: { warna: string | null }) {
  return <span aria-hidden className="kat size-3.5 shrink-0 rounded-full bg-(--kat)" style={gayaKategori(warna)} />;
}

export function KategoriTable({ kategori }: { kategori: Kategori[] }) {
  const { cari, setCari, hasil } = useClientSearch(kategori, (k) => [k.nama, k.slug]);
  const crud = useCrudDialog<Kategori, { nama: string; slug: string; warna: string | null; aktif: boolean }>({
    empty: { nama: "", slug: "", warna: null, aktif: true },
    toForm: (k) => ({ nama: k.nama, slug: k.slug, warna: k.warna, aktif: k.aktif }),
    store: tambahKategori,
    update: ubahKategori,
  });

  return (
    <>
      <PageHeader title="Kategori Berita" description="Rubrik berita. Kategori nonaktif tidak bisa dipilih saat menulis berita; halaman dan beritanya tetap tampil di portal.">
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah kategori
        </Button>
      </PageHeader>

      <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari kategori..." />

      <DataTableCard
        rows={hasil}
        rowKey={(k) => k.id}
        emptyText={cari ? `Tidak ada kategori yang cocok dengan "${cari}".` : "Belum ada kategori. Tambahkan lewat tombol Tambah kategori."}
        columns={[
          {
            header: "Nama",
            cell: (k) => (
              <span className="flex items-center gap-2 font-medium">
                <Swatch warna={k.warna} />
                {k.nama}
              </span>
            ),
          },
          { header: "Alamat", cell: (k) => <span className="text-muted-foreground">/kategori/{k.slug}</span> },
          { header: "Berita", cell: (k) => k._count.berita, className: "w-24 tabular-nums" },
          {
            header: "Bisa dipilih",
            cell: (k) => <ToggleAktif checked={k.aktif} action={(v) => aktifkanKategori(k.id, v)} label={`Kategori ${k.nama} bisa dipilih`} />,
            className: "w-24",
          },
          {
            header: "Aksi",
            cell: (k) => (
              <RowActions
                onEdit={() => crud.openEdit(k)}
                destroy={() => hapusKategori(k.id)}
                deleteTitle={`Hapus kategori ${k.nama}?`}
                deleteDescription={`${k._count.berita} berita di kategori ini akan menjadi tanpa kategori.`}
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah kategori" : "Tambah kategori"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="nama" label="Nama kategori" error={crud.form.errors.nama}>
          <Input
            id="nama"
            value={crud.form.data.nama}
            onChange={(e) => crud.form.setData("nama", e.target.value)}
            aria-invalid={!!crud.form.errors.nama}
            autoFocus
          />
        </Field>
        <Field id="slug" label="Slug" error={crud.form.errors.slug} hint="Kosongkan agar dibuat dari nama kategori.">
          <Input
            id="slug"
            value={crud.form.data.slug}
            onChange={(e) => crud.form.setData("slug", e.target.value)}
            aria-invalid={!!crud.form.errors.slug}
          />
        </Field>
        <Field id="warna" label="Warna rubrik" error={crud.form.errors.warna} hint="Dipakai untuk nama kategori dan garis judul rubrik di portal.">
          <Select
            value={crud.form.data.warna ?? TANPA_WARNA}
            onValueChange={(v) => crud.form.setData("warna", v === TANPA_WARNA ? null : v)}
          >
            <SelectTrigger id="warna" className="w-full" aria-invalid={!!crud.form.errors.warna || undefined}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TANPA_WARNA}>
                <Swatch warna={null} />
                Ikuti warna template
              </SelectItem>
              {WARNA_KATEGORI_KEYS.map((key: WarnaKategoriKey) => (
                <SelectItem key={key} value={key}>
                  <Swatch warna={key} />
                  {WARNA_KATEGORI[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-center gap-3">
          <Checkbox id="aktif" checked={crud.form.data.aktif} onCheckedChange={(v) => crud.form.setData("aktif", v === true)} />
          <Label htmlFor="aktif">Bisa dipilih saat menulis berita</Label>
        </div>
      </FormDialog>
    </>
  );
}
