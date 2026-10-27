"use server";

import { mediaUrl } from "@/lib/media";
import { requireUser } from "@/lib/session";
import { cekFile, isFile, simpanFile } from "@/lib/storage";

/** Gambar yang disisipkan ke isi artikel lewat editor. */
export async function unggahGambarEditor(file: unknown): Promise<{ url: string } | { error: string }> {
  await requireUser();

  if (!isFile(file)) {
    return { error: "File gambar tidak terbaca." };
  }

  const error = cekFile(file, "gambar");

  if (error) {
    return { error };
  }

  return { url: mediaUrl("berita", await simpanFile(file, "berita"))! };
}
