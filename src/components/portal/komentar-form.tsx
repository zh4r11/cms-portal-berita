"use client";

import Field from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@/hooks/use-form";
import type { ActionResult } from "@/lib/action";

type Form = { nama: string; email: string; url: string; isi: string; website: string };

/** Form komentar pembaca (berita dan video). `denganEmail` untuk komentar berita. */
export function KomentarForm({ kirim, denganEmail = true }: { kirim: (data: Form) => Promise<ActionResult>; denganEmail?: boolean }) {
  const form = useForm<Form>({ nama: "", email: "", url: "", isi: "", website: "" });
  const { data, setData, errors } = form;

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit(kirim, { onSuccess: () => setData((d) => ({ ...d, isi: "" })) });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="komentar-nama" label="Nama" error={errors.nama}>
          <Input id="komentar-nama" value={data.nama} onChange={(e) => setData("nama", e.target.value)} autoComplete="name" placeholder="Nama Anda" />
        </Field>
        {denganEmail && (
          <Field id="komentar-email" label="Email" error={errors.email} hint="Tidak ditampilkan.">
            <Input
              id="komentar-email"
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              autoComplete="email"
              placeholder="email@example.com"
            />
          </Field>
        )}
        <Field id="komentar-url" label="Situs web (opsional)" error={errors.url}>
          <Input id="komentar-url" value={data.url} onChange={(e) => setData("url", e.target.value)} placeholder="https://" />
        </Field>
      </div>
      {/* Kolom jebakan untuk bot; disembunyikan dari pembaca dan pembaca layar. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="komentar-website">Jangan diisi</label>
        <input id="komentar-website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData("website", e.target.value)} />
      </div>
      <Field id="komentar-isi" label="Komentar" error={errors.isi}>
        <Textarea id="komentar-isi" rows={4} maxLength={2000} value={data.isi} onChange={(e) => setData("isi", e.target.value)} placeholder="Tulis tanggapan Anda..." />
      </Field>
      <div>
        <Button type="submit" disabled={form.processing}>
          {form.processing && <Spinner />}
          Kirim komentar
        </Button>
      </div>
    </form>
  );
}
