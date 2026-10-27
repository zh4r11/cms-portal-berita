"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Foto = { id: number; judul: string; keterangan: string | null; src: string };

/** Grid foto; klik membuka foto besar. Panah kiri/kanan berpindah foto, Escape menutup. */
export function Galeri({ foto }: { foto: Foto[] }) {
  const [buka, setBuka] = useState<number | null>(null);
  const aktif = buka === null ? null : foto[buka];
  const geser = (arah: number) => setBuka((i) => (i === null ? null : (i + arah + foto.length) % foto.length));

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {foto.map((f, i) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setBuka(i)}
              className="block w-full overflow-hidden rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring"
            >
              <Image src={f.src} alt={f.judul} width={400} height={300} className="aspect-[4/3] w-full object-cover transition-opacity hover:opacity-90" />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={aktif !== null} onOpenChange={(open) => !open && setBuka(null)}>
        <DialogContent
          className="sm:max-w-4xl"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") geser(1);
            if (event.key === "ArrowLeft") geser(-1);
          }}
        >
          {aktif && (
            <div className="grid gap-3">
              <Image src={aktif.src} alt={aktif.judul} width={1600} height={1200} className="max-h-[70vh] w-full rounded-sm object-contain" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="font-serif">{aktif.judul}</DialogTitle>
                  <DialogDescription>
                    {aktif.keterangan ?? ""} Foto {buka! + 1} dari {foto.length}.
                  </DialogDescription>
                </div>
                {foto.length > 1 && (
                  <div className="flex shrink-0 gap-1">
                    <Button variant="outline" size="icon" onClick={() => geser(-1)} aria-label="Foto sebelumnya">
                      <ChevronLeft />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => geser(1)} aria-label="Foto berikutnya">
                      <ChevronRight />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
