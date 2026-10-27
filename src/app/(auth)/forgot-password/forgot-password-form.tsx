"use client";

import { useState, useTransition } from "react";
import { AuthHeading } from "@/components/auth-heading";
import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient, pesanAuthError } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [processing, startTransition] = useTransition();

  const kirim = () =>
    startTransition(async () => {
      setError(undefined);
      const { error } = await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo: "/reset-password",
      });

      if (error) {
        setError(pesanAuthError(error));

        return;
      }

      // Pesan sama walau email tidak terdaftar, agar tidak membocorkan akun.
      setStatus("Jika email terdaftar, tautan reset password telah dikirim.");
    });

  return (
    <>
      <AuthHeading title="Lupa password" description="Masukkan email Anda untuk menerima tautan reset password" />

      {status && (
        <Alert>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            kirim();
          }}
          className="grid gap-6"
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Alamat email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              autoFocus
              required
              placeholder="email@example.com"
            />
            <InputError message={error} />
          </div>

          <Button className="w-full" disabled={processing}>
            {processing && <Spinner />}
            Kirim tautan reset password
          </Button>
        </form>

        <div className="space-x-1 text-center text-sm text-muted-foreground">
          <span>Atau, kembali ke</span>
          <TextLink href="/login">halaman masuk</TextLink>
        </div>
      </div>
    </>
  );
}
