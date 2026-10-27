import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AktifBadge({
  aktif,
  labelAktif = "Aktif",
  labelNonaktif = "Tidak aktif",
}: {
  aktif: boolean;
  labelAktif?: string;
  labelNonaktif?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={
        aktif
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "text-muted-foreground"
      }
    >
      <span className={cn("size-1.5 rounded-full", aktif ? "bg-emerald-500" : "bg-muted-foreground/60")} />
      {aktif ? labelAktif : labelNonaktif}
    </Badge>
  );
}
