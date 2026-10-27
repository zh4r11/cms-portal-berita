"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { formatAngka } from "@/lib/format";
import type { PageMeta } from "@/lib/pagination";

/** Nomor halaman yang ditampilkan: awal, akhir, dan sekitar halaman aktif. */
function pages(current: number, last: number): (number | "...")[] {
  const result: (number | "...")[] = [];

  for (let page = 1; page <= last; page++) {
    if (page === 1 || page === last || Math.abs(page - current) <= 2) {
      result.push(page);
    } else if (result[result.length - 1] !== "...") {
      result.push("...");
    }
  }

  return result;
}

export default function Pagination({ meta }: { meta: PageMeta }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (meta.total === 0) {
    return null;
  }

  const href = (page: number) => {
    const params = new URLSearchParams(searchParams);

    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const query = params.toString();

    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row" data-print="hide">
      <p className="text-sm text-muted-foreground">
        Menampilkan {meta.from} sampai {meta.to} dari {formatAngka(meta.total)} data
      </p>
      {meta.lastPage > 1 && (
        <nav className="flex items-center gap-1">
          <PageButton href={meta.page > 1 ? href(meta.page - 1) : null} label="Sebelumnya">
            <ChevronLeft />
          </PageButton>
          {pages(meta.page, meta.lastPage).map((page, index) =>
            page === "..." ? (
              <span key={`gap-${index}`} className="px-2 text-sm text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                asChild
                size="sm"
                variant={page === meta.page ? "default" : "ghost"}
                className="min-w-8"
              >
                <Link href={href(page)} scroll={false}>
                  {page}
                </Link>
              </Button>
            ),
          )}
          <PageButton href={meta.page < meta.lastPage ? href(meta.page + 1) : null} label="Berikutnya">
            <ChevronRight />
          </PageButton>
        </nav>
      )}
    </div>
  );
}

function PageButton({ href, label, children }: { href: string | null; label: string; children: ReactNode }) {
  if (!href) {
    return (
      <Button size="icon" variant="ghost" className="size-8" disabled>
        {children}
        <span className="sr-only">{label}</span>
      </Button>
    );
  }

  return (
    <Button asChild size="icon" variant="ghost" className="size-8">
      <Link href={href} scroll={false}>
        {children}
        <span className="sr-only">{label}</span>
      </Link>
    </Button>
  );
}
