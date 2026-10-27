import "server-only";
import { cekFile, hapusFile, isFile, simpanFile, type Folder, type JenisFile } from "@/lib/storage";

type HasilUpload =
  | { error: string }
  | {
      /** Nama file baru, null bila dihapus, undefined bila tidak berubah. */
      nama: string | null | undefined;
      /** Panggil setelah data tersimpan: hapus file lama yang tergantikan. */
      selesai: () => Promise<void>;
      /** Panggil bila penyimpanan gagal: hapus file baru. */
      batal: () => Promise<void>;
    };

/**
 * Simpan file dari form (bila ada) dan siapkan pembersihan file lama.
 * `hapus` = pengguna menekan tombol Hapus pada file opsional.
 */
export async function prosesUpload({
  file,
  hapus = false,
  lama,
  folder,
  jenis = "gambar",
  wajib = false,
  label = "Gambar",
}: {
  file: unknown;
  hapus?: boolean;
  lama?: string | null;
  folder: Folder;
  jenis?: JenisFile;
  wajib?: boolean;
  label?: string;
}): Promise<HasilUpload> {
  const ada = isFile(file);

  if (ada) {
    const error = cekFile(file, jenis);

    if (error) {
      return { error };
    }
  }

  if (wajib && !ada && (!lama || hapus)) {
    return { error: `${label} wajib diunggah.` };
  }

  if (ada) {
    const nama = await simpanFile(file, folder);

    return {
      nama,
      selesai: () => hapusFile(folder, lama),
      batal: () => hapusFile(folder, nama),
    };
  }

  if (hapus && lama) {
    return { nama: null, selesai: () => hapusFile(folder, lama), batal: async () => {} };
  }

  return { nama: undefined, selesai: async () => {}, batal: async () => {} };
}
