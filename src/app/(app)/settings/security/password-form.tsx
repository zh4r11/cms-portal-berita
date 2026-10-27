"use client";

import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@/hooks/use-form";
import { ubahPassword } from "./actions";

export function PasswordForm({ passwordRules }: { passwordRules: string }) {
  const form = useForm({ current_password: "", password: "", password_confirmation: "" });

  return (
    <div className="space-y-6">
      <Heading
        variant="small"
        title="Ubah password"
        description="Gunakan password yang panjang dan acak agar akun tetap aman"
      />

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          form.submit(ubahPassword, { onSuccess: form.reset });
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="current_password">Password saat ini</Label>
          <PasswordInput
            id="current_password"
            value={form.data.current_password}
            onChange={(e) => form.setData("current_password", e.target.value)}
            autoComplete="current-password"
            placeholder="Password saat ini"
            aria-invalid={!!form.errors.current_password}
          />
          <InputError message={form.errors.current_password} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password baru</Label>
          <PasswordInput
            id="password"
            value={form.data.password}
            onChange={(e) => form.setData("password", e.target.value)}
            autoComplete="new-password"
            placeholder="Password baru"
            passwordrules={passwordRules}
            aria-invalid={!!form.errors.password}
          />
          <InputError message={form.errors.password} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password_confirmation">Konfirmasi password</Label>
          <PasswordInput
            id="password_confirmation"
            value={form.data.password_confirmation}
            onChange={(e) => form.setData("password_confirmation", e.target.value)}
            autoComplete="new-password"
            placeholder="Ulangi password baru"
            aria-invalid={!!form.errors.password_confirmation}
          />
          <InputError message={form.errors.password_confirmation} />
        </div>

        <Button disabled={form.processing}>
          {form.processing && <Spinner />}
          Simpan password
        </Button>
      </form>
    </div>
  );
}
