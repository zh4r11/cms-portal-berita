"use client";

import { Camera, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useActionResult } from "@/hooks/use-form";
import { initials } from "@/lib/utils";
import { perbaruiProfil } from "./actions";

type User = { name: string; username: string; email: string; noTelp: string; image: string | null };

const MAX_AVATAR = 2 * 1024 * 1024;
const MIME_GAMBAR = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ProfileForm({ user }: { user: User }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [data, setData] = useState({ name: user.name, username: user.username, email: user.email, noTelp: user.noTelp });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [hapusAvatar, setHapusAvatar] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, startTransition] = useTransition();
  const handleResult = useActionResult();

  const gantiAvatar = (file: File | null) => {
    // Dicek di browser juga: file besar ditolak Next sebelum sampai ke Server Action.
    const pesan =
      file && !MIME_GAMBAR.includes(file.type)
        ? "Foto harus berupa gambar JPG, PNG, WEBP, atau GIF."
        : file && file.size > MAX_AVATAR
          ? "Ukuran foto maksimal 2 MB."
          : undefined;

    setErrors((previous) => {
      const next = { ...previous };
      delete next.avatar;

      return pesan ? { ...next, avatar: pesan } : next;
    });

    if (pesan) {
      if (fileInput.current) {
        fileInput.current.value = "";
      }

      return;
    }

    setAvatar(file);
    setPreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  };

  useEffect(() => () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  }, [preview]);

  const avatarUrl = hapusAvatar ? undefined : (preview ?? user.image ?? undefined);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("username", data.username);
    formData.set("email", data.email);
    formData.set("noTelp", data.noTelp);
    formData.set("hapus_avatar", hapusAvatar ? "1" : "0");
    if (avatar) {
      formData.set("avatar", avatar);
    }

    startTransition(async () => {
      const result = await perbaruiProfil(formData);
      setErrors(result.ok ? {} : (result.errors ?? {}));
      handleResult(result);
    });
  };

  return (
    <div className="space-y-6">
      <Heading variant="small" title="Profil" description="Perbarui foto, nama, username, email, dan nomor telepon Anda" />

      <form onSubmit={submit} className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={avatarUrl} alt={user.name} className="object-cover" />
            <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
                <Camera />
                Ganti foto
              </Button>
              {(user.image || preview) && !hapusAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    gantiAvatar(null);
                    setHapusAvatar(true);

                    if (fileInput.current) {
                      fileInput.current.value = "";
                    }
                  }}
                >
                  <Trash2 />
                  Hapus foto
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, atau GIF. Maksimal 2 MB.</p>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                gantiAvatar(event.target.files?.[0] ?? null);
                setHapusAvatar(false);
              }}
            />
            <InputError message={errors.avatar} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
            autoComplete="name"
            aria-invalid={!!errors.name}
          />
          <InputError message={errors.name} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={data.username}
            onChange={(e) => setData({ ...data, username: e.target.value })}
            required
            autoComplete="username"
            aria-invalid={!!errors.username}
          />
          <InputError message={errors.username} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Alamat email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
          <InputError message={errors.email} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="noTelp">No. telepon</Label>
          <Input
            id="noTelp"
            type="tel"
            value={data.noTelp}
            onChange={(e) => setData({ ...data, noTelp: e.target.value })}
            autoComplete="tel"
            aria-invalid={!!errors.noTelp}
          />
          <InputError message={errors.noTelp} />
        </div>

        <Button type="submit" disabled={processing}>
          {processing && <Spinner />}
          Simpan
        </Button>
      </form>
    </div>
  );
}
