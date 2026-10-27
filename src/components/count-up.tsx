"use client";

import { useEffect, useState } from "react";
import { formatAngka } from "@/lib/format";

/**
 * Angka yang "menghitung" dari 0 ke `value` saat tampil.
 * Pengguna dengan prefers-reduced-motion langsung melihat angka akhir.
 */
export function CountUp({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      // Stempel waktu rAF bisa sedikit lebih awal dari `start`, jadi dibatasi ke 0..1.
      const progress = reduce ? 1 : Math.min(Math.max((now - start) / duration, 0), 1);
      // easeOutCubic: cepat di awal, melambat di akhir.
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  // Pembaca layar langsung mendapat angka akhir, bukan angka yang sedang berjalan.
  return (
    <span>
      <span aria-hidden>{formatAngka(current)}</span>
      <span className="sr-only">{formatAngka(value)}</span>
    </span>
  );
}
