"use client";

import { ImageUp, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MIME = {
  gambar: { accept: "image/jpeg,image/png,image/gif,image/webp", maxMb: 2, hint: "JPG, PNG, GIF, atau WEBP. Maksimal 2 MB." },
  video: { accept: "video/mp4,video/webm", maxMb: 50, hint: "MP4 atau WEBM. Maksimal 50 MB." },
  berkas: { accept: undefined, maxMb: 20, hint: "Maksimal 20 MB." },
} as const;

/**
 * Pilih file untuk diunggah lewat Server Action. `current` adalah URL file
 * yang sudah tersimpan; `onRemove` menampilkan tombol hapus untuk file opsional.
 * Ukuran dicek di browser juga karena file besar ditolak Next sebelum sampai ke action.
 */
export default function ImageInput({
  id,
  label,
  value,
  onChange,
  current,
  currentName,
  onRemove,
  removed = false,
  error,
  jenis = "gambar",
}: {
  id: string;
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  current?: string | null;
  currentName?: string | null;
  onRemove?: () => void;
  removed?: boolean;
  error?: string;
  jenis?: keyof typeof MIME;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string>();
  const aturan = MIME[jenis];
  const preview = useMemo(() => (value && jenis === "gambar" ? URL.createObjectURL(value) : null), [value, jenis]);

  useEffect(
    () => () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    },
    [preview],
  );

  const tampil = preview ?? (removed ? null : (current ?? null));
  const namaFile = value?.name ?? (removed ? null : currentName);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        {jenis === "gambar" && tampil && (
          // eslint-disable-next-line @next/next/no-img-element -- pratinjau blob: tidak bisa lewat next/image
          <img src={tampil} alt="" className="h-16 w-24 rounded-md border object-cover" />
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
            <ImageUp />
            {tampil || namaFile ? "Ganti file" : "Pilih file"}
          </Button>
          {onRemove && (tampil || namaFile) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null);
                onRemove();

                if (input.current) {
                  input.current.value = "";
                }
              }}
            >
              <X />
              Hapus
            </Button>
          )}
        </div>
        {jenis !== "gambar" && namaFile && <span className="min-w-0 truncate text-sm text-muted-foreground">{namaFile}</span>}
      </div>
      <input
        ref={input}
        id={id}
        type="file"
        accept={aturan.accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;

          if (file && file.size > aturan.maxMb * 1024 * 1024) {
            setLocalError(`Ukuran file maksimal ${aturan.maxMb} MB.`);
            event.target.value = "";

            return;
          }

          setLocalError(undefined);
          onChange(file);
        }}
      />
      {!(error || localError) && <p className="text-xs text-muted-foreground">{aturan.hint}</p>}
      <InputError message={localError ?? error} />
    </div>
  );
}
