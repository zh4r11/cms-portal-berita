"use client";

import Field from "@/components/field";
import ImageInput from "@/components/image-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@/hooks/use-form";
import { simpanIdentitas } from "./actions";

type Form = {
  namaWebsite: string;
  email: string;
  url: string;
  facebook: string;
  rekening: string;
  noTelp: string;
  metaDeskripsi: string;
  metaKeyword: string;
  favicon: File | null;
  hapusFavicon: boolean;
};

export function IdentitasForm({ initial, faviconUrl }: { initial: Form; faviconUrl: string | null }) {
  const form = useForm<Form>(initial);
  const { data, setData, errors } = form;
  const text = (key: Exclude<keyof Form, "favicon" | "hapusFavicon">) => ({
    id: key,
    value: data[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setData(key, e.target.value),
    "aria-invalid": !!errors[key],
  });

  return (
    <form
      className="grid max-w-3xl gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit(simpanIdentitas, { onSuccess: () => setData("favicon", null) });
      }}
    >
      <Field id="namaWebsite" label="Nama website" error={errors.namaWebsite} hint="Tampil di judul tab browser dan di portal bila belum ada logo.">
        <Input {...text("namaWebsite")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="email" label="Email redaksi" error={errors.email}>
          <Input type="email" {...text("email")} />
        </Field>
        <Field id="noTelp" label="No. telepon" error={errors.noTelp}>
          <Input type="tel" {...text("noTelp")} />
        </Field>
        <Field id="url" label="Alamat website" error={errors.url}>
          <Input {...text("url")} placeholder="https://" />
        </Field>
        <Field id="facebook" label="Halaman Facebook" error={errors.facebook}>
          <Input {...text("facebook")} placeholder="https://www.facebook.com/..." />
        </Field>
      </div>
      <Field id="rekening" label="Rekening" error={errors.rekening} hint="Untuk pemasangan iklan; tampil di halaman Hubungi Kami.">
        <Input {...text("rekening")} />
      </Field>
      <Field id="metaDeskripsi" label="Deskripsi situs (meta description)" error={errors.metaDeskripsi}>
        <Textarea rows={3} maxLength={250} {...text("metaDeskripsi")} />
      </Field>
      <Field id="metaKeyword" label="Kata kunci (meta keywords)" error={errors.metaKeyword} hint="Pisahkan dengan koma.">
        <Input {...text("metaKeyword")} />
      </Field>
      <ImageInput
        id="favicon"
        label="Favicon"
        value={data.favicon}
        onChange={(file) => setData((d) => ({ ...d, favicon: file, hapusFavicon: false }))}
        current={faviconUrl}
        removed={data.hapusFavicon}
        onRemove={() => setData("hapusFavicon", true)}
        error={errors.favicon}
      />
      <div>
        <Button type="submit" disabled={form.processing}>
          {form.processing && <Spinner />}
          Simpan identitas
        </Button>
      </div>
    </form>
  );
}
