import type { CSSProperties } from "react";

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

/**
 * Warna rubrik seperti The Guardian: nama kategori, garis judul bagian, dan
 * blok rubrik di beranda memakai warna kategorinya. Nilai terang lolos 4.5:1 di
 * atas latar putih, nilai gelap lolos 4.5:1 di atas latar mode gelap.
 */
export const WARNA_KATEGORI = {
  merah: { label: "Merah", light: "oklch(0.5 0.19 27)", dark: "oklch(0.72 0.16 27)" },
  oranye: { label: "Oranye", light: "oklch(0.52 0.15 50)", dark: "oklch(0.76 0.14 55)" },
  emas: { label: "Emas", light: "oklch(0.5 0.11 80)", dark: "oklch(0.8 0.13 85)" },
  hijau: { label: "Hijau", light: "oklch(0.48 0.12 150)", dark: "oklch(0.76 0.14 150)" },
  toska: { label: "Toska", light: "oklch(0.5 0.09 195)", dark: "oklch(0.76 0.1 195)" },
  biru: { label: "Biru", light: "oklch(0.48 0.16 255)", dark: "oklch(0.74 0.12 255)" },
  ungu: { label: "Ungu", light: "oklch(0.48 0.17 300)", dark: "oklch(0.74 0.13 300)" },
  magenta: { label: "Magenta", light: "oklch(0.5 0.19 350)", dark: "oklch(0.74 0.15 350)" },
} as const;

export type WarnaKategoriKey = keyof typeof WARNA_KATEGORI;

export const WARNA_KATEGORI_KEYS = Object.keys(WARNA_KATEGORI) as [WarnaKategoriKey, ...WarnaKategoriKey[]];

/**
 * Atribut style untuk elemen ber-class `kat`: mengisi --kat-light/--kat-dark
 * sehingga `text-(--kat)` dan `border-(--kat)` mengikuti warna kategori.
 * Kategori tanpa warna jatuh ke warna template (--primary).
 */
export function gayaKategori(warna: string | null | undefined): CSSProperties | undefined {
  if (!warna || !(warna in WARNA_KATEGORI)) {
    return undefined;
  }

  const { light, dark } = WARNA_KATEGORI[warna as WarnaKategoriKey];

  return { "--kat-light": light, "--kat-dark": dark } as CSSProperties;
}
