"use client";

import Field from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@/hooks/use-form";
import { kirimPesan } from "../actions";

export function HubungiForm() {
  const form = useForm({ nama: "", email: "", subjek: "", pesan: "", website: "" });
  const { data, setData, errors } = form;

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit(kirimPesan, { onSuccess: form.reset });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="nama" label="Nama" error={errors.nama}>
          <Input id="nama" value={data.nama} onChange={(e) => setData("nama", e.target.value)} autoComplete="name" placeholder="Nama Anda" />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <Input id="email" type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} autoComplete="email" placeholder="email@example.com" />
        </Field>
      </div>
      <Field id="subjek" label="Subjek" error={errors.subjek}>
        <Input id="subjek" value={data.subjek} onChange={(e) => setData("subjek", e.target.value)} />
      </Field>
      <div className="hidden" aria-hidden>
        <label htmlFor="hubungi-website">Jangan diisi</label>
        <input id="hubungi-website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData("website", e.target.value)} />
      </div>
      <Field id="pesan" label="Pesan" error={errors.pesan}>
        <Textarea id="pesan" rows={6} maxLength={5000} value={data.pesan} onChange={(e) => setData("pesan", e.target.value)} placeholder="Tulis pesan Anda..." />
      </Field>
      <div>
        <Button type="submit" disabled={form.processing}>
          {form.processing && <Spinner />}
          Kirim pesan ke redaksi
        </Button>
      </div>
    </form>
  );
}
