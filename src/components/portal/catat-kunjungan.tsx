"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Kirim satu ping kunjungan setiap pindah halaman portal. */
export function CatatKunjungan() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/kunjungan", { method: "POST", keepalive: true }).catch(() => {});
  }, [pathname]);

  return null;
}
