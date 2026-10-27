"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import ImageInput from "@/components/image-input";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import TextLink from "@/components/text-link";
import Thumb from "@/components/thumb";
import ToggleAktif from "@/components/toggle-aktif";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import type { ActionResult } from "@/lib/action";

export type KoleksiRow = {
  id: number;
  judul: string;
  slug: string;
  keterangan?: string | null;
  aktif: boolean;
  gambarUrl: string | null;
  jumlah: number;
};

export type KoleksiForm = {
  judul: string;
  slug: string;
  keterangan: string;
  aktif: boolean;
  gambar: File | null;
  hapusGambar: boolean;
};

/** Album foto dan playlist video: wadah bersampul untuk galeri/video. */
export function KoleksiTable({
  title,
  description,
  nama,
  satuan,
  publicPrefix,
  isiPrefix,
  denganKeterangan = false,
  rows,
  tambah,
  ubah,
  aktifkan,
  hapus,
}: {
  title: string;
  description: string;
  nama: string;
  satuan: string;
  publicPrefix: string;
  /** Tautan ke isi koleksi; id ditambahkan di belakang. */
  isiPrefix: string;
  denganKeterangan?: boolean;
  rows: KoleksiRow[];
  tambah: (data: KoleksiForm) => Promise<ActionResult>;
  ubah: (id: number, data: KoleksiForm) => Promise<ActionResult>;
  aktifkan: (id: number, aktif: boolean) => Promise<ActionResult>;
  hapus: (id: number) => Promise<ActionResult>;
}) {
  const { cari, setCari, hasil } = useClientSearch(rows, (r) => [r.judul]);
  const crud = useCrudDialog<KoleksiRow, KoleksiForm>({
    empty: { judul: "", slug: "", keterangan: "", aktif: true, gambar: null, hapusGambar: false },
    toForm: (r) => ({ judul: r.judul, slug: r.slug, keterangan: r.keterangan ?? "", aktif: r.aktif, gambar: null, hapusGambar: false }),
    store: tambah,
    update: ubah,
  });

  return (
    <>
      <PageHeader title={title} description={description}>
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah {nama}
        </Button>
      </PageHeader>

      <ClientSearchInput value={cari} onChange={setCari} placeholder={`Cari ${nama}...`} />

      <DataTableCard
        rows={hasil}
        rowKey={(r) => r.id}
        emptyText={cari ? `Tidak ada ${nama} yang cocok dengan "${cari}".` : `Belum ada ${nama}.`}
        columns={[
          { header: "Sampul", cell: (r) => <Thumb src={r.gambarUrl} />, className: "w-20" },
          {
            header: "Judul",
            cell: (r) => (
              <div className="min-w-48">
                <p className="font-medium">{r.judul}</p>
                <p className="text-xs text-muted-foreground">
                  {publicPrefix}
                  {r.slug}
                </p>
              </div>
            ),
          },
          {
            header: satuan,
            cell: (r) => <TextLink href={`${isiPrefix}${r.id}`}>{r.jumlah} {satuan.toLowerCase()}</TextLink>,
            className: "w-28 tabular-nums",
          },
          {
            header: "Tampil",
            cell: (r) => <ToggleAktif checked={r.aktif} action={(v) => aktifkan(r.id, v)} label={`Tampilkan ${r.judul}`} />,
            className: "w-24",
          },
          {
            header: "Aksi",
            cell: (r) => (
              <RowActions
                onEdit={() => crud.openEdit(r)}
                destroy={() => hapus(r.id)}
                deleteTitle={`Hapus ${nama} ${r.judul}?`}
                deleteDescription={`${r.jumlah} ${satuan.toLowerCase()} di dalamnya ikut terpengaruh.`}
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? `Ubah ${nama}` : `Tambah ${nama}`}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="judul" label="Judul" error={crud.form.errors.judul}>
          <Input id="judul" value={crud.form.data.judul} onChange={(e) => crud.form.setData("judul", e.target.value)} autoFocus />
        </Field>
        <Field id="slug" label="Slug" error={crud.form.errors.slug} hint="Kosongkan agar dibuat dari judul.">
          <Input id="slug" value={crud.form.data.slug} onChange={(e) => crud.form.setData("slug", e.target.value)} />
        </Field>
        {denganKeterangan && (
          <Field id="keterangan" label="Keterangan" error={crud.form.errors.keterangan}>
            <Textarea id="keterangan" value={crud.form.data.keterangan} onChange={(e) => crud.form.setData("keterangan", e.target.value)} />
          </Field>
        )}
        <ImageInput
          id="gambar"
          label="Sampul"
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
