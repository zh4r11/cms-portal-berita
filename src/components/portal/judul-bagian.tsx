import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Judul bagian bergaya rubrik koran: garis tebal warna template di atas.
 * Motif ini dipakai berulang di beranda, sidebar, dan halaman daftar.
 */
export function JudulBagian({
  as: Tag = "h2",
  id,
  children,
  href,
  hrefLabel,
}: {
  as?: "h1" | "h2";
  id?: string;
  children: ReactNode;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4 border-t-4 border-primary pt-2">
      <Tag id={id} className={Tag === "h1" ? "font-serif text-2xl font-bold sm:text-3xl" : "font-serif text-lg font-bold"}>
        {children}
      </Tag>
      {href && (
        <Link href={href} className="shrink-0 text-sm text-muted-foreground hover:text-foreground hover:underline">
          {hrefLabel}
        </Link>
      )}
    </div>
  );
}
