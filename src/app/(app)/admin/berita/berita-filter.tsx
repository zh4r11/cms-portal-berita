"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SimpleSelect } from "@/components/select-field";

const SEMUA = "semua";

/** Filter status terbit dan kategori lewat query string. */
export function BeritaFilter({
  status,
  kategori,
  daftarKategori,
}: {
  status: string;
  kategori: string;
  daftarKategori: { id: number; nama: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");

    if (value && value !== SEMUA) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <>
      <label htmlFor="filter-status" className="sr-only">
        Status
      </label>
      <SimpleSelect
        id="filter-status"
        className="w-full sm:w-40"
        value={status || SEMUA}
        onChange={(v) => set("status", v)}
        options={[
          { value: SEMUA, label: "Semua status" },
          { value: "terbit", label: "Terbit" },
          { value: "draf", label: "Draf" },
        ]}
      />
      <label htmlFor="filter-kategori" className="sr-only">
        Kategori
      </label>
      <SimpleSelect
        id="filter-kategori"
        className="w-full sm:w-48"
        value={kategori || SEMUA}
        onChange={(v) => set("kategori", v)}
        options={[{ value: SEMUA, label: "Semua kategori" }, ...daftarKategori.map((k) => ({ value: String(k.id), label: k.nama }))]}
      />
    </>
  );
}
