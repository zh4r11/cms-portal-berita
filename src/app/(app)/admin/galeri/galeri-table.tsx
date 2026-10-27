"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import ImageInput from "@/components/image-input";
import PageHeader from "@/components/page-header";
import Pagination from "@/components/pagination";
import RowActions from "@/components/row-actions";
import { SimpleSelect } from "@/components/select-field";
import Thumb from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import type { PageMeta } from "@/lib/pagination";
import { hapusFoto, tambahFoto, ubahFoto } from "./actions";

type Foto = { id: number; albumId: number; album: string; judul: string; keterangan: string | null; gambarUrl: string };
type Form = { albumId: string; judul: string; keterangan: string; gambar: File | null };

const SEMUA = "semua";

export function GaleriTable({
  foto,
  album,
  albumId,
  meta,
}: {
  foto: Foto[];
  album: { id: number; judul: string }[];
  albumId: string;
  meta: PageMeta;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const crud = useCrudDialog<Foto, Form>({
    empty: { albumId, judul: "", keterangan: "", gambar: null },
    toForm: (f) => ({ albumId: String(f.albumId), judul: f.judul, keterangan: f.keterangan ?? "", gambar: null }),
    store: tambahFoto,
    update: ubahFoto,
  });
  const opsiAlbum = album.map((a) => ({ value: String(a.id), label: a.judul }));

  return (
    <>
      <PageHeader title="Galeri Foto" description="Foto di dalam album berita foto.">
        <Button onClick={crud.openCreate} disabled={album.length === 0}>
          <Plus />
          Tambah foto
        </Button>
      </PageHeader>

      {album.length === 0 ? (
        <p className="text-sm text-muted-foreground">Buat album lebih dulu di menu Album Foto, lalu tambahkan foto ke dalamnya.</p>
      ) : (
        <div className="w-full sm:w-72">
          <label htmlFor="filter-album" className="sr-only">
            Album
          </label>
          <SimpleSelect
            id="filter-album"
            value={albumId || SEMUA}
            onChange={(v) => router.replace(v === SEMUA ? pathname : `${pathname}?album=${v}`, { scroll: false })}
            options={[{ value: SEMUA, label: "Semua album" }, ...opsiAlbum]}
          />
        </div>
      )}

      <DataTableCard
        rows={foto}
        rowKey={(f) => f.id}
        emptyText={albumId ? "Album ini belum berisi foto." : "Belum ada foto di galeri."}
        columns={[
          { header: "Foto", cell: (f) => <Thumb src={f.gambarUrl} alt={f.judul} className="h-14 w-20" />, className: "w-24" },
          {
            header: "Judul",
            cell: (f) => (
              <div className="max-w-md min-w-48 whitespace-normal">
                <p className="font-medium">{f.judul}</p>
                {f.keterangan && <p className="line-clamp-2 text-xs text-muted-foreground">{f.keterangan}</p>}
              </div>
            ),
          },
          { header: "Album", cell: (f) => f.album, className: "w-48" },
          {
            header: "Aksi",
            cell: (f) => <RowActions onEdit={() => crud.openEdit(f)} destroy={() => hapusFoto(f.id)} deleteTitle={`Hapus foto ${f.judul}?`} />,
            className: "w-24 text-right",
          },
        ]}
      />

      <Pagination meta={meta} />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah foto" : "Tambah foto"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="albumId" label="Album" error={crud.form.errors.albumId}>
          <SimpleSelect
            id="albumId"
            value={crud.form.data.albumId}
            onChange={(v) => crud.form.setData("albumId", v)}
            options={opsiAlbum}
            placeholder="Pilih album..."
            invalid={!!crud.form.errors.albumId}
          />
        </Field>
        <Field id="judul" label="Judul foto" error={crud.form.errors.judul}>
          <Input id="judul" value={crud.form.data.judul} onChange={(e) => crud.form.setData("judul", e.target.value)} />
        </Field>
        <Field id="keterangan" label="Keterangan" error={crud.form.errors.keterangan}>
          <Textarea id="keterangan" value={crud.form.data.keterangan} onChange={(e) => crud.form.setData("keterangan", e.target.value)} />
        </Field>
        <ImageInput
          id="gambar"
          label="Foto"
          value={crud.form.data.gambar}
          onChange={(file) => crud.form.setData("gambar", file)}
          current={crud.editing?.gambarUrl}
          error={crud.form.errors.gambar}
        />
      </FormDialog>
    </>
  );
}
