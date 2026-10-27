"use client";

import Link from "next/link";
import Field from "@/components/field";
import ImageInput from "@/components/image-input";
import RichTextEditor from "@/components/rich-text-editor";
import { SimpleSelect } from "@/components/select-field";
import TagPicker from "@/components/tag-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@/hooks/use-form";
import { tambahBerita, ubahBerita } from "./actions";

export type BeritaFormData = {
  judul: string;
  subJudul: string;
  slug: string;
  kategoriId: string;
  isi: string;
  youtube: string;
  keteranganGambar: string;
  tags: string[];
  headline: boolean;
  utama: boolean;
  aktif: boolean;
  publishedAt: string;
  gambar: File | null;
  hapusGambar: boolean;
};

const TANPA = "0";

export function BeritaForm({
  id,
  initial,
  gambarUrl,
  kategori,
  tags,
}: {
  id?: number;
  initial: BeritaFormData;
  gambarUrl?: string | null;
  kategori: { id: number; nama: string }[];
  tags: string[];
}) {
  const form = useForm<BeritaFormData>(initial);
  const { data, setData, errors } = form;

  const simpan = (aktif: boolean) => {
    const payload = { ...data, aktif, kategoriId: data.kategoriId === TANPA ? "" : data.kategoriId };
    form.submit(() => (id ? ubahBerita(id, payload) : tambahBerita(payload)));
  };

  return (
    <form
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      onSubmit={(event) => {
        event.preventDefault();
        simpan(data.aktif);
      }}
    >
      <div className="grid min-w-0 content-start gap-6">
        <Field id="judul" label="Judul" error={errors.judul}>
          <Input
            id="judul"
            value={data.judul}
            onChange={(e) => setData("judul", e.target.value)}
            className="h-11 font-serif text-lg"
            aria-invalid={!!errors.judul}
            autoFocus={!id}
          />
        </Field>
        <Field id="subJudul" label="Sub judul (opsional)" error={errors.subJudul}>
          <Input id="subJudul" value={data.subJudul} onChange={(e) => setData("subJudul", e.target.value)} />
        </Field>
        <Field id="isi" label="Isi berita" error={errors.isi}>
          <RichTextEditor id="isi" value={data.isi} onChange={(html) => setData("isi", html)} invalid={!!errors.isi} />
        </Field>
      </div>

      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Penerbitan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field id="publishedAt" label="Tanggal terbit" error={errors.publishedAt}>
              <Input id="publishedAt" type="datetime-local" value={data.publishedAt} onChange={(e) => setData("publishedAt", e.target.value)} />
            </Field>
            <div className="flex items-start gap-3">
              <Checkbox id="headline" checked={data.headline} onCheckedChange={(v) => setData("headline", v === true)} />
              <div className="grid gap-1">
                <Label htmlFor="headline">Headline</Label>
                <p className="text-xs text-muted-foreground">Tampil sebagai berita utama di atas beranda.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="utama" checked={data.utama} onCheckedChange={(v) => setData("utama", v === true)} />
              <div className="grid gap-1">
                <Label htmlFor="utama">Pilihan redaksi</Label>
                <p className="text-xs text-muted-foreground">Masuk daftar pilihan redaksi di beranda.</p>
              </div>
            </div>
            <div className="grid gap-2 pt-2">
              <Button type="button" onClick={() => simpan(true)} disabled={form.processing}>
                {form.processing && <Spinner />}
                {initial.aktif ? "Simpan perubahan" : "Terbitkan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => simpan(false)} disabled={form.processing}>
                {initial.aktif ? "Jadikan draf" : "Simpan sebagai draf"}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/admin/berita">Batal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rubrik</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field id="kategoriId" label="Kategori" error={errors.kategoriId}>
              <SimpleSelect
                id="kategoriId"
                value={data.kategoriId || TANPA}
                onChange={(v) => setData("kategoriId", v)}
                options={[{ value: TANPA, label: "Tanpa kategori" }, ...kategori.map((k) => ({ value: String(k.id), label: k.nama }))]}
              />
            </Field>
            <Field id="tags" label="Tag" error={errors.tags}>
              <TagPicker id="tags" options={tags} value={data.tags} onChange={(v) => setData("tags", v)} />
            </Field>
            <Field id="slug" label="Slug" error={errors.slug} hint="Kosongkan agar dibuat dari judul.">
              <Input id="slug" value={data.slug} onChange={(e) => setData("slug", e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ImageInput
              id="gambar"
              label="Foto utama"
              value={data.gambar}
              onChange={(file) => setData((d) => ({ ...d, gambar: file, hapusGambar: false }))}
              current={gambarUrl}
              removed={data.hapusGambar}
              onRemove={() => setData("hapusGambar", true)}
              error={errors.gambar}
            />
            <Field id="keteranganGambar" label="Keterangan foto" error={errors.keteranganGambar}>
              <Textarea id="keteranganGambar" rows={2} value={data.keteranganGambar} onChange={(e) => setData("keteranganGambar", e.target.value)} />
            </Field>
            <Field id="youtube" label="Video YouTube (opsional)" error={errors.youtube} hint="Tempel alamat video atau ID-nya.">
              <Input
                id="youtube"
                value={data.youtube}
                onChange={(e) => setData("youtube", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </Field>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
