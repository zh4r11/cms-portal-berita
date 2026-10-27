"use client";

import { Switch } from "@/components/ui/switch";
import { useAction } from "@/hooks/use-form";
import type { ActionResult } from "@/lib/action";

/** Saklar aktif/nonaktif langsung di baris tabel. */
export default function ToggleAktif({
  checked,
  action,
  label,
}: {
  checked: boolean;
  action: (aktif: boolean) => Promise<ActionResult>;
  label: string;
}) {
  const [pending, run] = useAction();

  return <Switch checked={checked} disabled={pending} onCheckedChange={(value) => run(() => action(value))} aria-label={label} />;
}
