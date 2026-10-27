import { z } from "zod";

/** Teks wajib diisi, dipangkas spasinya. */
export function teks(label: string, max = 255) {
  return z
    .string({ error: `${label} wajib diisi.` })
    .trim()
    .min(1, `${label} wajib diisi.`)
    .max(max, `${label} maksimal ${max} karakter.`);
}

/** Teks opsional; string kosong disimpan sebagai null. */
export function teksOpsional(label: string, max = 255) {
  return z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter.`)
    .nullish()
    .transform((value) => value || null);
}

/** ID relasi wajib dari <select> (string atau angka). */
export function idWajib(label: string) {
  return z.coerce
    .number({ error: `${label} wajib dipilih.` })
    .int()
    .positive(`${label} wajib dipilih.`);
}

/** ID relasi opsional; kosong menjadi null. */
export function idOpsional() {
  return z
    .union([z.literal(""), z.null(), z.undefined(), z.coerce.number().int().positive()])
    .transform((value) => (typeof value === "number" ? value : null));
}

export function pilihan<const T extends readonly [string, ...string[]]>(label: string, values: T) {
  return z
    .string({ error: `${label} wajib dipilih.` })
    .min(1, `${label} wajib dipilih.`)
    .pipe(z.enum(values, { error: `${label} yang dipilih tidak valid.` }));
}

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username minimal 3 karakter.")
  .max(30, "Username maksimal 30 karakter.")
  .regex(/^[a-z0-9_-]+$/, "Username hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email wajib diisi.")
  .max(255, "Email maksimal 255 karakter.")
  .pipe(z.email("Format email tidak valid."));

/** Aturan password: produksi lebih ketat, setara Password::defaults() lama. */
export const passwordSchema =
  process.env.NODE_ENV === "production"
    ? z
        .string()
        .min(12, "Password minimal 12 karakter.")
        .regex(/[a-z]/, "Password harus mengandung huruf kecil.")
        .regex(/[A-Z]/, "Password harus mengandung huruf besar.")
        .regex(/[0-9]/, "Password harus mengandung angka.")
        .regex(/[^a-zA-Z0-9]/, "Password harus mengandung simbol.")
    : z.string().min(8, "Password minimal 8 karakter.");

export const PASSWORD_RULES_HINT =
  process.env.NODE_ENV === "production"
    ? "minlength: 12; required: lower; required: upper; required: digit; required: special;"
    : "minlength: 8;";
