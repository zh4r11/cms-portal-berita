"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tombol =
  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring outline-none";

/** Tombol bagikan artikel. WhatsApp didahulukan karena paling banyak dipakai pembaca di Indonesia. */
export function Bagikan({ url, judul, className }: { url: string; judul: string; className?: string }) {
  const [tersalin, setTersalin] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(judul);
  const tujuan = [
    { nama: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { nama: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { nama: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
  ];

  async function salin() {
    try {
      await navigator.clipboard.writeText(url);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      // Clipboard ditolak (mis. bukan HTTPS); tautan tetap bisa disalin dari bilah alamat.
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="mr-1 text-sm text-muted-foreground">Bagikan</span>
      {tujuan.map((b) => (
        <a key={b.nama} href={b.href} target="_blank" rel="noopener noreferrer" className={tombol}>
          {b.nama}
        </a>
      ))}
      <button type="button" onClick={salin} className={tombol}>
        {tersalin ? <Check className="size-4" /> : <Link2 className="size-4" />}
        {tersalin ? "Tersalin" : "Salin tautan"}
      </button>
      <span role="status" className="sr-only">
        {tersalin ? "Tautan tersalin" : ""}
      </span>
    </div>
  );
}
