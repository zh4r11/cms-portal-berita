import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Pengganti tabel saat datanya kosong. Ditampilkan tanpa tabel supaya pesannya
 * tidak ikut terpotong oleh scroll horizontal tabel di layar sempit.
 */
export function EmptyState({
  icon: Icon = PackageOpen,
  children,
  bare = false,
}: {
  icon?: LucideIcon;
  children: ReactNode;
  /** Tanpa Card pembungkus, untuk dipakai di dalam Card yang sudah ada. */
  bare?: boolean;
}) {
  const content = (
    <div className={cn("flex flex-col items-center gap-2 px-6 text-center text-sm text-muted-foreground", bare ? "py-8" : "py-12")}>
      <Icon className="size-8" />
      <p className="max-w-sm text-balance">{children}</p>
    </div>
  );

  return bare ? content : <Card className="py-0">{content}</Card>;
}
