"use client";

import Link from "next/link";
import Field from "@/components/field";
import ImageInput from "@/components/image-input";
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@/hooks/use-form";
import { tambahAgenda, ubahAgenda } from "./actions";

export type AgendaFormData = {
  tema: string;
  slug: string;
  isi: string;
  tempat: string;
  pengirim: string;
  jam: string;
  tglMulai: string;
  tglSelesai: string;
  gambar: File | null;
  hapusGambar: boolean;
};

export function AgendaForm({ id, initial, gambarUrl }: { id?: number; initial: AgendaFormData; gambarUrl?: string | null }) {
  const form = useForm<AgendaFormData>(initial);
  const { data, setData, errors } = form;

  return (
    <form
      className="grid max-w-3xl gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit((d) => (id ? ubahAgenda(id, d) : tambahAgenda(d)));
      }}
    >
      <Field id="tema" label="Tema acara" error={errors.tema}>
        <Input id="tema" value={data.tema} onChange={(e) => setData("tema", e.target.value)} className="h-11 font-serif text-lg" autoFocus={!id} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="tempat" label="Tempat" error={errors.tempat}>
          <Input id="tempat" value={data.tempat} onChange={(e) => setData("tempat", e.target.value)} />
        </Field>
        <Field id="pengirim" label="Pengirim / penyelenggara" error={errors.pengirim}>
          <Input id="pengirim" value={data.pengirim} onChange={(e) => setData("pengirim", e.target.value)} />
        </Field>
        <Field id="tglMulai" label="Tanggal mulai" error={errors.tglMulai}>
          <Input id="tglMulai" type="date" value={data.tglMulai} onChange={(e) => setData("tglMulai", e.target.value)} />
        </Field>
        <Field id="tglSelesai" label="Tanggal selesai" error={errors.tglSelesai}>
          <Input id="tglSelesai" type="date" value={data.tglSelesai} onChange={(e) => setData("tglSelesai", e.target.value)} />
        </Field>
        <Field id="jam" label="Jam" error={errors.jam} hint="Teks bebas, mis. 19.00 WIB s.d. selesai.">
          <Input id="jam" value={data.jam} onChange={(e) => setData("jam", e.target.value)} />
        </Field>
        <Field id="slug" label="Slug" error={errors.slug} hint="Kosongkan agar dibuat dari tema.">
          <Input id="slug" value={data.slug} onChange={(e) => setData("slug", e.target.value)} />
        </Field>
      </div>
      <Field id="isi" label="Keterangan" error={errors.isi}>
        <RichTextEditor id="isi" value={data.isi} onChange={(html) => setData("isi", html)} invalid={!!errors.isi} />
      </Field>
      <ImageInput
        id="gambar"
        label="Poster (opsional)"
        value={data.gambar}
        onChange={(file) => setData((d) => ({ ...d, gambar: file, hapusGambar: false }))}
        current={gambarUrl}
        removed={data.hapusGambar}
        onRemove={() => setData("hapusGambar", true)}
        error={errors.gambar}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={form.processing}>
          {form.processing && <Spinner />}
          Simpan agenda
        </Button>
        <Button asChild variant="ghost">
          <Link href="/admin/agenda">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
