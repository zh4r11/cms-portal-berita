import type { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

/**
 * Hasil Server Action yang dipakai seluruh form. `message` ditampilkan
 * sebagai toast, `errors` per field (kunci memakai path, mis. `rakitan.0.jumlah`),
 * dan `redirect` dinavigasikan oleh klien setelah sukses.
 */
export type ActionResult =
  | { ok: true; message?: string; redirect?: string }
  | { ok: false; message?: string; errors?: Record<string, string> };

export function success(message?: string, redirect?: string): ActionResult {
  return { ok: true, message, redirect };
}

export function failure(message: string, errors?: Record<string, string>): ActionResult {
  return { ok: false, message, errors };
}

export function fieldErrors(errors: Record<string, string>): ActionResult {
  return { ok: false, errors };
}

export function zodErrors(error: z.ZodError): ActionResult {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");
    errors[key] ??= issue.message;
  }

  return { ok: false, errors };
}

/** Pelanggaran unique constraint pada kolom tertentu. */
export function isUniqueViolation(error: unknown, field?: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  if (!field) {
    return true;
  }

  return JSON.stringify(error.meta ?? {}).includes(field);
}

/** Pelanggaran foreign key (data masih dipakai tabel lain). */
export function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}
