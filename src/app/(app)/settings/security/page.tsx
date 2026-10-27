import type { Metadata } from "next";
import { PASSWORD_RULES_HINT } from "@/lib/validation";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Ubah password" };

export default function SecurityPage() {
  return (
    <>
      <h1 className="sr-only">Ubah password</h1>
      <PasswordForm passwordRules={PASSWORD_RULES_HINT} />
    </>
  );
}
