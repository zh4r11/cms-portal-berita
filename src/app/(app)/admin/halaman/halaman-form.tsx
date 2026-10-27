"use client";

import Link from "next/link";
import Field from "@/components/field";
import ImageInput from "@/components/image-input";
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@/hooks/use-form";
import { tambahHalaman, ubahHalaman } from "./actions";

type Form = { judul: string; slug: string; isi: string; gambar: File | null; hapusGambar: boolean };

export function HalamanForm({ id, initial, gambarUrl }: { id?: number; initial: Form; gambarUrl?: string | null }) {
  const form = useForm<Form>(initial);
  const { data, setData, errors } = form;

  return (
    <form
      className="grid max-w-3xl gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit((d) => (id ? ubahHalaman(id, d) : tambahHalaman(d)));
      }}
    >
      <Field id="judul" label="Judul" error={errors.judul}>
        <Input id="judul" value={data.judul} onChange={(e) => setData("judul", e.target.value)} className="h-11 font-serif text-lg" autoFocus={!id} />
      </Field>
      <Field id="slug" label="Slug" error={errors.slug} hint="Kosongkan agar dibuat dari judul. Alamatnya menjadi /halaman/slug.">
        <Input id="slug" value={data.slug} onChange={(e) => setData("slug", e.target.value)} />
      </Field>
      <Field id="isi" label="Isi halaman" error={errors.isi}>
        <RichTextEditor id="isi" value={data.isi} onChange={(html) => setData("isi", html)} invalid={!!errors.isi} />
      </Field>
      <ImageInput
        id="gambar"
        label="Gambar (opsional)"
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
          Simpan halaman
        </Button>
        <Button asChild variant="ghost">
          <Link href="/admin/halaman">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
