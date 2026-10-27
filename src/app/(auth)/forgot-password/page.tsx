import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Lupa Password" };

export default function Page() {
  return <ForgotPasswordForm />;
}
