import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), usernameClient()],
});

const PESAN_ERROR: Record<string, string> = {
  INVALID_USERNAME_OR_PASSWORD: "Username atau password salah.",
  INVALID_EMAIL_OR_PASSWORD: "Username atau password salah.",
  INVALID_PASSWORD: "Password salah.",
  INVALID_TOKEN: "Tautan reset password tidak valid atau sudah kedaluwarsa.",
  PASSWORD_TOO_SHORT: "Password terlalu pendek.",
  ACCOUNT_BLOCKED: "Akun Anda sedang diblokir. Silakan hubungi admin.",
};

/** Pesan error Better Auth dalam Bahasa Indonesia. */
export function pesanAuthError(error: { code?: string; message?: string; status?: number } | null | undefined): string {
  if (!error) {
    return "Terjadi kesalahan. Silakan coba lagi.";
  }

  if (error.status === 429) {
    return "Terlalu banyak percobaan. Silakan tunggu sebentar.";
  }

  return (error.code && PESAN_ERROR[error.code]) || error.message || "Terjadi kesalahan. Silakan coba lagi.";
}
