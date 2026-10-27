"use client";

import Field from "@/components/field";
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@/hooks/use-form";
import { simpanAlamat } from "./actions";

export function AlamatForm({ alamat }: { alamat: string }) {
  const form = useForm({ alamat });

  return (
    <form
      className="grid max-w-2xl gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit(simpanAlamat);
      }}
    >
      <Field id="alamat" label="Alamat" error={form.errors.alamat} hint="Kosongkan untuk menyembunyikan alamat dari portal.">
        <RichTextEditor id="alamat" value={form.data.alamat} onChange={(html) => form.setData("alamat", html)} />
      </Field>
      <div>
        <Button type="submit" disabled={form.processing}>
          {form.processing && <Spinner />}
          Simpan alamat
        </Button>
      </div>
    </form>
  );
}
