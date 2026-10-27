"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import ConfirmDelete from "@/components/confirm-delete";
import ImageInput from "@/components/image-input";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@/hooks/use-form";
import type { ActionResult } from "@/lib/action";

/** Modul satu gambar (logo, background): lihat, ganti, atau hapus. */
export function GambarTunggal({
  title,
  description,
  current,
  simpan,
  hapus,
}: {
  title: string;
  description: string;
  current: string | null;
  simpan: (data: { gambar: File | null }) => Promise<ActionResult>;
  hapus: () => Promise<ActionResult>;
}) {
  const form = useForm<{ gambar: File | null }>({ gambar: null });

  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="max-w-2xl">
        <CardContent className="grid gap-6">
          <div className="flex min-h-32 items-center justify-center rounded-lg border bg-muted/40 p-4">
            {current ? (
              <Image src={current} alt={`${title} saat ini`} width={600} height={240} className="h-auto max-h-60 w-auto max-w-full object-contain" />
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada gambar. Portal memakai tampilan bawaan.</p>
            )}
          </div>

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              form.submit(simpan, { onSuccess: () => form.setData("gambar", null) });
            }}
          >
            <ImageInput
              id="gambar"
              label={current ? "Ganti gambar" : "Unggah gambar"}
              value={form.data.gambar}
              onChange={(file) => form.setData("gambar", file)}
              error={form.errors.gambar}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={form.processing || !form.data.gambar}>
                {form.processing && <Spinner />}
                Simpan gambar
              </Button>
              {current && (
                <ConfirmDelete action={hapus} title={`Hapus ${title.toLowerCase()}?`} description="Portal kembali memakai tampilan bawaan.">
                  <Button type="button" variant="ghost" className="text-destructive hover:text-destructive">
                    <Trash2 />
                    Hapus
                  </Button>
                </ConfirmDelete>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
