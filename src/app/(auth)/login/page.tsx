import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth-heading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { param } from "@/lib/pagination";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

const STATUS: Record<string, string> = {
  diblokir: "Akun Anda sedang diblokir. Silakan hubungi admin.",
  reset: "Password berhasil diubah. Silakan masuk dengan password baru.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const status = STATUS[param((await searchParams).status)];

  return (
    <>
      <AuthHeading title="Masuk ke panel redaksi" description="Gunakan username dan password akun redaksi Anda" />

      {status && (
        <Alert>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}

      <LoginForm />
    </>
  );
}
