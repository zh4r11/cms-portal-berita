export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Portal Berita";

/** Zona waktu tanggal terbit dan statistik kunjungan. */
export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE ?? "Asia/Jakarta";

/** Username akun utama yang tidak boleh dihapus, diblokir, atau diturunkan levelnya. */
export const SUPER_ADMIN = "admin";

export function isSuperAdmin(username: string | null | undefined): boolean {
  return (username ?? "").toLowerCase() === SUPER_ADMIN;
}

/**
 * Skema warna portal publik, padanan folder layout/biru, layout/merah, dan
 * layout/hijau di versi lama. Nilainya dipasang sebagai --primary di layout publik.
 * Kedua nilai lolos kontras 4.5:1 dengan teks putih.
 */
export const TEMA = {
  merah: { label: "Merah", light: "oklch(0.5 0.19 27)", dark: "oklch(0.62 0.2 27)" },
  biru: { label: "Biru", light: "oklch(0.48 0.16 255)", dark: "oklch(0.62 0.16 255)" },
  hijau: { label: "Hijau", light: "oklch(0.47 0.12 155)", dark: "oklch(0.62 0.13 155)" },
} as const;

export type TemaKey = keyof typeof TEMA;

export const TEMA_KEYS = Object.keys(TEMA) as [TemaKey, ...TemaKey[]];

export function temaValid(folder: string | null | undefined): TemaKey {
  return folder && folder in TEMA ? (folder as TemaKey) : "merah";
}
