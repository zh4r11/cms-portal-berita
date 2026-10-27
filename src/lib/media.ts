/** URL publik file unggahan, mis. mediaUrl("berita", "foto.jpg") → /media/berita/foto.jpg */
export function mediaUrl(folder: string, nama: string | null | undefined): string | null {
  return nama ? `/media/${folder}/${encodeURIComponent(nama)}` : null;
}

/** Ambil ID video dari URL YouTube atau ID polos. */
export function youtubeId(value: string | null | undefined): string | null {
  const input = value?.trim();

  if (!input) {
    return null;
  }

  if (/^[\w-]{11}$/.test(input)) {
    return input;
  }

  const match = input.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);

  return match?.[1] ?? null;
}
