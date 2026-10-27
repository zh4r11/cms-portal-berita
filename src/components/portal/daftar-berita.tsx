import { Newspaper } from "lucide-react";
import Pagination from "@/components/pagination";
import type { Prisma } from "@/generated/prisma/client";
import { paginate } from "@/lib/pagination";
import { beritaTerbit, kartuBerita } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { BeritaItem } from "./berita-item";

/** Daftar berita terbit berhalaman untuk indeks, kategori, tag, dan pencarian. */
export async function DaftarBerita({ where = {}, page, kosong }: { where?: Prisma.BeritaWhereInput; page: number; kosong: string }) {
  const filter = { AND: [beritaTerbit(), where] };
  const total = await prisma.berita.count({ where: filter });
  const p = paginate(page, total, 12);
  const berita = await prisma.berita.findMany({ where: filter, orderBy: { publishedAt: "desc" }, skip: p.skip, take: p.take, select: kartuBerita });

  if (berita.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        <Newspaper className="size-8" />
        <p className="max-w-sm">{kosong}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y">
        {berita.map((b, i) => (
          <li key={b.id} className="py-4 first:pt-0">
            <BeritaItem berita={b} priority={i < 2} />
          </li>
        ))}
      </ul>
      <Pagination meta={p.meta(berita.length)} />
    </div>
  );
}
