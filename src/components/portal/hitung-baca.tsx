"use client";

import { useEffect, useRef } from "react";

/** Kirim satu ping baca saat halaman berita dibuka (lihat /api/berita/[id]/dibaca). */
export function HitungBaca({ id }: { id: number }) {
  // StrictMode menjalankan effect dua kali di dev; ref mencegah hitungan ganda.
  const terkirim = useRef<number | null>(null);

  useEffect(() => {
    if (terkirim.current === id) {
      return;
    }

    terkirim.current = id;
    fetch(`/api/berita/${id}/dibaca`, { method: "POST", keepalive: true }).catch(() => {});
  }, [id]);

  return null;
}
