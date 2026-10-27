"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "@/hooks/use-form";
import type { ActionResult } from "@/lib/action";

export default function ConfirmDelete({
  action,
  title = "Hapus data ini?",
  description = "Data yang dihapus tidak dapat dikembalikan.",
  confirmLabel = "Hapus",
  children,
}: {
  action: () => Promise<ActionResult>;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [processing, run] = useAction();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={processing}
            onClick={(event) => {
              event.preventDefault();
              run(action, () => setOpen(false));
            }}
          >
            {processing && <Spinner />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
