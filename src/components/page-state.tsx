"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function LoadingState({ label = "Memuat halaman..." }: { label?: string }) {
  return (
    <div role="status" className="flex flex-1 items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
      <Spinner />
      {label}
    </div>
  );
}

/**
 * Isi error.tsx. Pesan error server tidak ditampilkan (bisa memuat detail internal);
 * kode digest cukup untuk mencocokkan dengan log server.
 */
export function ErrorState({
  error,
  retry,
  backHref,
  backLabel,
}: {
  error: unknown;
  retry: () => void;
  backHref: string;
  backLabel: string;
}) {
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </span>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Halaman ini gagal dimuat</h1>
        <p className="text-sm text-muted-foreground">
          Biasanya karena koneksi ke database terputus sesaat. Coba muat ulang. Kalau tetap gagal, laporkan ke admin
          sistem{digest ? " beserta kode di bawah" : ""}.
        </p>
        {digest && <p className="font-mono text-xs text-muted-foreground">Kode: {digest}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={retry}>
          <RotateCcw />
          Muat ulang
        </Button>
        <Button asChild variant="outline">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
