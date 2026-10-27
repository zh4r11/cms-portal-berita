"use client";

import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@/hooks/use-form";
import { resetPassword } from "./actions";

export function ResetPasswordForm({ token, passwordRules }: { token: string; passwordRules: string }) {
  const form = useForm({ token, password: "", password_confirmation: "" });

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit(resetPassword);
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="password">Password baru</Label>
        <PasswordInput
          id="password"
          value={form.data.password}
          onChange={(e) => form.setData("password", e.target.value)}
          autoComplete="new-password"
          autoFocus
          required
          placeholder="Password"
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
          required
          placeholder="Ulangi password"
          aria-invalid={!!form.errors.password_confirmation}
        />
        <InputError message={form.errors.password_confirmation} />
      </div>

      <Button type="submit" className="mt-2 w-full" disabled={form.processing}>
        {form.processing && <Spinner />}
        Simpan password
      </Button>
    </form>
  );
}
