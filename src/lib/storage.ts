import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * File unggahan disimpan di luar /public (Next.js tidak menyajikan file
 * yang ditambahkan ke /public setelah build) dan disajikan oleh /media/[folder]/[file].
 * Bila SUPABASE_URL dan SUPABASE_SECRET_KEY diisi (mis. di Vercel, yang disknya
 * tidak permanen), file disimpan di bucket Supabase Storage, bukan di folder ini.
 */
export const STORAGE_DIR = path.join(process.cwd(), "storage");

export const BUCKET = process.env.SUPABASE_BUCKET || "media";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

export const pakaiSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

function urlObjek(folder: Folder, nama: string, publik = false) {
  return `${SUPABASE_URL}/storage/v1/object/${publik ? "public/" : ""}${BUCKET}/${folder}/${encodeURIComponent(nama)}`;
}

const authSupabase = () => ({ apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` });

/** URL publik file di bucket (dipakai route /media sebagai sumber proxy). */
export function urlPublikSupabase(folder: Folder, nama: string) {
  return urlObjek(folder, nama, true);
}

export const FOLDER = [
  "berita",
  "halaman",
  "agenda",
  "album",
  "galeri",
  "playlist",
  "video",
  "videofile",
  "download",
  "banner",
  "header",
  "iklanatas",
  "iklantengah",
  "pasangiklan",
  "logo",
  "background",
  "sekilasinfo",
  "user",
  "favicon",
] as const;

export type Folder = (typeof FOLDER)[number];

const JENIS = {
  gambar: { mime: ["image/jpeg", "image/png", "image/gif", "image/webp"], maxMb: 2, label: "JPG, PNG, GIF, atau WEBP" },
  video: { mime: ["video/mp4", "video/webm"], maxMb: 50, label: "MP4 atau WEBM" },
  berkas: { mime: [] as string[], maxMb: 20, label: "berkas apa pun" },
} as const;

export type JenisFile = keyof typeof JENIS;

export function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

/** Pesan error bila file tidak sesuai jenis/ukuran, atau null bila valid. */
export function cekFile(file: File, jenis: JenisFile): string | null {
  const aturan = JENIS[jenis];

  if (aturan.mime.length && !(aturan.mime as readonly string[]).includes(file.type)) {
    return `Format file harus ${aturan.label}.`;
  }

  if (file.size > aturan.maxMb * 1024 * 1024) {
    return `Ukuran file maksimal ${aturan.maxMb} MB.`;
  }

  return null;
}

function namaAman(original: string): string {
  const ext = path.extname(original).toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 8);
  const base = path
    .basename(original, path.extname(original))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${randomBytes(4).toString("hex")}-${base || "file"}${ext}`;
}

export async function simpanFile(file: File, folder: Folder): Promise<string> {
  const nama = namaAman(file.name);

  if (pakaiSupabase) {
    const res = await fetch(urlObjek(folder, nama), {
      method: "POST",
      headers: { ...authSupabase(), "Content-Type": file.type || "application/octet-stream" },
      body: Buffer.from(await file.arrayBuffer()),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengunggah ke Supabase Storage: ${res.status} ${await res.text()}`);
    }

    return nama;
  }

  const dir = path.join(STORAGE_DIR, folder);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, nama), Buffer.from(await file.arrayBuffer()));

  return nama;
}

export async function hapusFile(folder: Folder, nama: string | null | undefined) {
  if (!nama || nama.includes("/") || nama.includes("\\")) {
    return;
  }

  if (pakaiSupabase) {
    await fetch(urlObjek(folder, nama), { method: "DELETE", headers: authSupabase() });
    return;
  }

  await rm(path.join(STORAGE_DIR, folder, nama), { force: true });
}
