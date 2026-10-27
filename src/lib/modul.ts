/**
 * Daftar modul panel redaksi. Kuncinya disimpan di kolom `modul.link`
 * dan menjadi path halaman: /admin/<kunci>. Nama, urutan, dan status aktif
 * bisa diubah di menu Manajemen Modul; daftar kuncinya tetap di sini supaya
 * setiap item sidebar selalu punya halaman.
 */
export const MODUL = {
  berita: { nama: "Berita", grup: "Konten" },
  kategori: { nama: "Kategori Berita", grup: "Konten" },
  tag: { nama: "Tag Berita", grup: "Konten" },
  komentar: { nama: "Komentar Berita", grup: "Konten" },
  katajelek: { nama: "Sensor Kata", grup: "Konten" },
  halaman: { nama: "Halaman Statis", grup: "Konten" },
  agenda: { nama: "Agenda", grup: "Konten" },
  sekilasinfo: { nama: "Sekilas Info", grup: "Konten" },

  album: { nama: "Album Foto", grup: "Foto & Video" },
  galeri: { nama: "Galeri Foto", grup: "Foto & Video" },
  playlist: { nama: "Playlist Video", grup: "Foto & Video" },
  video: { nama: "Video", grup: "Foto & Video" },
  tagvideo: { nama: "Tag Video", grup: "Foto & Video" },
  komentarvideo: { nama: "Komentar Video", grup: "Foto & Video" },
  download: { nama: "Download", grup: "Foto & Video" },

  poling: { nama: "Jajak Pendapat", grup: "Pembaca" },
  hubungi: { nama: "Pesan Masuk", grup: "Pembaca" },
  member: { nama: "Member", grup: "Pembaca" },

  banner: { nama: "Iklan Utama", grup: "Iklan" },
  iklanatas: { nama: "Iklan Layanan", grup: "Iklan" },
  iklantengah: { nama: "Iklan Depan", grup: "Iklan" },
  pasangiklan: { nama: "Iklan Kiri", grup: "Iklan" },

  identitas: { nama: "Identitas Website", grup: "Tampilan" },
  menu: { nama: "Menu Website", grup: "Tampilan" },
  templates: { nama: "Template Warna", grup: "Tampilan" },
  logo: { nama: "Logo", grup: "Tampilan" },
  header: { nama: "Header", grup: "Tampilan" },
  background: { nama: "Background", grup: "Tampilan" },
  alamat: { nama: "Alamat Kontak", grup: "Tampilan" },
  ym: { nama: "Kontak YM", grup: "Tampilan" },

  users: { nama: "Manajemen User", grup: "Pengguna" },
  modul: { nama: "Manajemen Modul", grup: "Pengguna" },
} as const;

export type ModulKey = keyof typeof MODUL;

export const MODUL_KEYS = Object.keys(MODUL) as ModulKey[];

/** Modul yang secara bawaan hanya untuk level admin. */
export const MODUL_ADMIN: ModulKey[] = ["users", "modul", "identitas", "templates", "member"];

export function isModulKey(value: string): value is ModulKey {
  return value in MODUL;
}
