import { Download, FileDown } from "lucide-react";
import type { Metadata } from "next";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { formatAngka, formatTanggal } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Download" };

export default async function DownloadPage() {
  const download = await prisma.download.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <JudulBagian as="h1">Download</JudulBagian>
      {download.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          <FileDown className="size-8" />
          <p>Belum ada file yang bisa diunduh.</p>
        </div>
      ) : (
        <ul className="max-w-2xl divide-y">
          {download.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">{d.judul}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTanggal(d.createdAt)} · diunduh {formatAngka(d.hits)} kali
                </p>
              </div>
              <a
                href={`/download/${d.id}`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring pointer-coarse:h-11"
              >
                <Download className="size-4" />
                Unduh
                <span className="sr-only"> {d.judul}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
