"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Input pencarian yang memperbarui query string `cari` di URL saat ini
 * (halaman paginasi kembali ke 1).
 */
export default function SearchInput({
  value,
  placeholder = "Cari...",
  className,
}: {
  value: string;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cari, setCari] = useState(value);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;

      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.delete("page");

      if (cari) {
        params.set("cari", cari);
      } else {
        params.delete("cari");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cari]);

  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={cari}
        onChange={(event) => setCari(event.target.value)}
        placeholder={placeholder}
        className="pr-9 pl-8 pointer-coarse:pr-12"
      />
      {cari && (
        <button
          type="button"
          onClick={() => setCari("")}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-2.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring pointer-coarse:px-3.5"
        >
          <X className="size-4" />
          <span className="sr-only">Hapus pencarian</span>
        </button>
      )}
    </div>
  );
}

/**
 * Filter sederhana di sisi klien untuk tabel master data.
 */
export function useClientSearch<T>(items: T[], fields: (item: T) => string[]) {
  const [cari, setCari] = useState("");
  const keyword = cari.trim().toLowerCase();

  const hasil = keyword
    ? items.filter((item) => fields(item).some((field) => field?.toLowerCase().includes(keyword)))
    : items;

  return { cari, setCari, hasil };
}

export function ClientSearchInput({
  value,
  onChange,
  placeholder = "Cari...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  );
}
