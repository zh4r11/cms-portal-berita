import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth-heading";
import TextLink from "@/components/text-link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { param } from "@/lib/pagination";
import { PASSWORD_RULES_HINT } from "@/lib/validation";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const query = await searchParams;
  const token = param(query.token);
  const invalid = !token || param(query.error) !== "";

  return (
    <>
      <AuthHeading title="Reset password" description="Masukkan password baru Anda" />

      {invalid ? (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>Tautan reset password tidak valid atau sudah kedaluwarsa.</AlertDescription>
          </Alert>
          <p className="text-center text-sm text-muted-foreground">
            <TextLink href="/forgot-password">Minta tautan baru</TextLink>
          </p>
        </div>
      ) : (
        <ResetPasswordForm token={token} passwordRules={PASSWORD_RULES_HINT} />
      )}
    </>
  );
}
