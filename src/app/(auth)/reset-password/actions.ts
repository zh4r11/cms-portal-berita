"use server";

import { APIError } from "better-auth/api";
import { z } from "zod";
import { failure, success, zodErrors, type ActionResult } from "@/lib/action";
import { auth } from "@/lib/auth";
import { passwordSchema } from "@/lib/validation";

const schema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Konfirmasi password tidak cocok.",
  });

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  try {
    await auth.api.resetPassword({ body: { token: parsed.data.token, newPassword: parsed.data.password } });
  } catch (error) {
    if (error instanceof APIError) {
      return failure("Tautan reset password tidak valid atau sudah kedaluwarsa.");
    }

    throw error;
  }

  return success(undefined, "/login?status=reset");
}
