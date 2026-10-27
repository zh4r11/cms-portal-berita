import { prisma } from "@/lib/prisma";

/**
 * Lima tabel bergambar dengan kolom yang sama (judul, url, gambar):
 * header, banner, iklanatas, iklantengah, pasangiklan. Kuncinya sama dengan
 * kunci modul dan nama folder storage.
 */
export const JENIS_IKLAN = {
  header: { posisi: "Gambar masthead di atas menu portal. Yang terbaru dipakai.", ukuran: "Lebar penuh, mis. 1200 x 200 px." },
  banner: { posisi: "Daftar tautan bergambar di sidebar portal.", ukuran: "Mis. 300 x 100 px." },
  iklanatas: { posisi: "Iklan di samping nama situs pada masthead.", ukuran: "Mis. 728 x 90 px." },
  iklantengah: { posisi: "Iklan lebar di tengah beranda.", ukuran: "Mis. 728 x 90 px." },
  pasangiklan: { posisi: "Iklan di bagian bawah sidebar portal.", ukuran: "Mis. 300 x 250 px." },
} as const;

export type JenisIklan = keyof typeof JENIS_IKLAN;

export function isJenisIklan(value: string): value is JenisIklan {
  return value in JENIS_IKLAN;
}

/** Kelima model punya kolom yang sama, jadi diperlakukan dengan satu tipe. */
export function modelIklan(jenis: JenisIklan) {
  const model = {
    header: prisma.header,
    banner: prisma.banner,
    iklanatas: prisma.iklanAtas,
    iklantengah: prisma.iklanTengah,
    pasangiklan: prisma.pasangIklan,
  }[jenis];

  return model as unknown as typeof prisma.banner;
}
