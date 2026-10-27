import type { ReactNode } from "react";
import InputError from "@/components/input-error";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Label + kontrol + pesan error, pola yang sama di semua form panel. */
export default function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <InputError message={error} />
    </div>
  );
}
