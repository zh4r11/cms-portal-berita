import { Newspaper } from "lucide-react";

/**
 * Belum ada logo resmi untuk panel: ikon koran + nama situs sebagai teks.
 * Logo yang diunggah di modul Logo dipakai di portal publik.
 */
export default function AppLogo({ nama = "Panel Redaksi" }: { nama?: string }) {
  return (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Newspaper className="size-5" />
      </div>
      <div className="ml-1 grid flex-1 text-left text-sm">
        <span className="truncate leading-tight font-semibold">{nama}</span>
        <span className="truncate text-xs text-muted-foreground">Panel redaksi</span>
      </div>
    </>
  );
}
