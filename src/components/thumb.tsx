import { ImageOff } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Gambar kecil di sel tabel; kotak kosong bila belum ada gambar. */
export default function Thumb({ src, alt = "", className }: { src: string | null; alt?: string; className?: string }) {
  if (!src) {
    return (
      <span className={cn("flex h-10 w-14 items-center justify-center rounded-md border bg-muted text-muted-foreground", className)}>
        <ImageOff className="size-4" />
        <span className="sr-only">Tanpa gambar</span>
      </span>
    );
  }

  return (
    <Image src={src} alt={alt} width={112} height={80} className={cn("h-10 w-14 rounded-md border object-cover", className)} />
  );
}
