"use client";

import Link from "next/link";
import Field from "@/components/field";
import ImageInput from "@/components/image-input";
import RichTextEditor from "@/components/rich-text-editor";
import { SimpleSelect } from "@/components/select-field";
import TagPicker from "@/components/tag-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@/hooks/use-form";
import { tambahVideo, ubahVideo } from "./actions";

export type VideoFormData = {
  playlistId: string;
  judul: string;
  slug: string;
  keterangan: string;
  youtube: string;
  tags: string[];
  publishedAt: string;
  gambar: File | null;
  hapusGambar: boolean;
  file: File | null;
  hapusFile: boolean;
};

const TANPA = "0";

export function VideoForm({
  id,
  initial,
  gambarUrl,
  namaFile,
  playlist,
  tags,
}: {
  id?: number;
  initial: VideoFormData;
  gambarUrl?: string | null;
  namaFile?: string | null;
  playlist: { id: number; judul: string }[];
  tags: string[];
}) {
  const form = useForm<VideoFormData>(initial);
  const { data, setData, errors } = form;

  return (
    <form
      className="grid max-w-3xl gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        const payload = { ...data, playlistId: data.playlistId === TANPA ? "" : data.playlistId };
        form.submit(() => (id ? ubahVideo(id, payload) : tambahVideo(payload)));
      }}
    >
      <Field id="judul" label="Judul" error={errors.judul}>
        <Input id="judul" value={data.judul} onChange={(e) => setData("judul", e.target.value)} className="h-11 font-serif text-lg" autoFocus={!id} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="playlistId" label="Playlist" error={errors.playlistId}>
          <SimpleSelect
            id="playlistId"
            value={data.playlistId || TANPA}
            onChange={(v) => setData("playlistId", v)}
            options={[{ value: TANPA, label: "Tanpa playlist" }, ...playlist.map((p) => ({ value: String(p.id), label: p.judul }))]}
          />
        </Field>
        <Field id="publishedAt" label="Tanggal tayang" error={errors.publishedAt}>
          <Input id="publishedAt" type="datetime-local" value={data.publishedAt} onChange={(e) => setData("publishedAt", e.target.value)} />
        </Field>
        <Field id="youtube" label="Video YouTube" error={errors.youtube} hint="Atau kosongkan dan unggah file video di bawah.">
          <Input id="youtube" value={data.youtube} onChange={(e) => setData("youtube", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        </Field>
        <Field id="slug" label="Slug" error={errors.slug} hint="Kosongkan agar dibuat dari judul.">
          <Input id="slug" value={data.slug} onChange={(e) => setData("slug", e.target.value)} />
        </Field>
      </div>
      <ImageInput
        id="file"
        jenis="video"
        label="File video"
        value={data.file}
        onChange={(file) => setData((d) => ({ ...d, file, hapusFile: false }))}
        currentName={namaFile}
        removed={data.hapusFile}
        onRemove={() => setData("hapusFile", true)}
        error={errors.file}
      />
      <ImageInput
        id="gambar"
        label="Thumbnail"
        value={data.gambar}
        onChange={(file) => setData((d) => ({ ...d, gambar: file, hapusGambar: false }))}
        current={gambarUrl}
        removed={data.hapusGambar}
        onRemove={() => setData("hapusGambar", true)}
        error={errors.gambar}
      />
      <Field id="tags" label="Tag" error={errors.tags}>
        <TagPicker id="tags" options={tags} value={data.tags} onChange={(v) => setData("tags", v)} />
      </Field>
      <Field id="keterangan" label="Keterangan" error={errors.keterangan}>
        <RichTextEditor id="keterangan" value={data.keterangan} onChange={(html) => setData("keterangan", html)} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={form.processing}>
          {form.processing && <Spinner />}
          Simpan video
        </Button>
        <Button asChild variant="ghost">
          <Link href="/admin/video">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
