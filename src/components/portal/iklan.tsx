import Image from "next/image";
import { cn } from "@/lib/utils";

/** Gambar iklan/header: bertautan bila punya URL. */
export function Iklan({
  url,
  judul,
  src,
  width,
  height,
  className,
  imgClassName = "h-auto w-full",
}: {
  url: string | null;
  judul: string;
  src: string;
  width: number;
  height: number;
  className?: string;
  /** Batas ukuran gambar; iklan bisa berasal dari unggahan dengan rasio apa pun. */
  imgClassName?: string;
}) {
  const img = <Image src={src} alt={judul} width={width} height={height} className={cn("max-w-full rounded-sm object-contain", imgClassName)} />;

  return (
    <div className={className}>
      {url ? (
        <a href={url} target={url.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer sponsored" className="block">
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}
