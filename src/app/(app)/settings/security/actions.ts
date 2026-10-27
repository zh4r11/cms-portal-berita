"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/session";
import { passwordSchema } from "@/lib/validation";

const schema = z
  .object({
    current_password: z.string().min(1, "Password saat ini wajib diisi."),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Konfirmasi password tidak cocok.",
  });

export async function ubahPassword(input: unknown): Promise<ActionResult> {
  await requireUser();
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.current_password,
        newPassword: parsed.data.password,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return fieldErrors({ current_password: "Password saat ini salah." });
    }

    throw error;
  }

  return success("Password berhasil diperbarui.");
}
