"use client";

import { useState } from "react";
import { useForm } from "@/hooks/use-form";
import type { ActionResult } from "@/lib/action";

/**
 * State dialog tambah/ubah untuk halaman master data.
 *
 * `toForm` mengubah record menjadi nilai form; tanpa record berarti mode tambah.
 */
export function useCrudDialog<T extends { id: number | string }, F extends Record<string, unknown>>({
  empty,
  toForm,
  store,
  update,
}: {
  empty: F;
  toForm: (record: T) => F;
  store: (data: F) => Promise<ActionResult>;
  update: (id: T["id"], data: F) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const form = useForm<F>(empty);

  const openCreate = () => {
    setEditing(null);
    form.clearErrors();
    form.setData(empty);
    setOpen(true);
  };

  const openEdit = (record: T) => {
    setEditing(record);
    form.clearErrors();
    form.setData(toForm(record));
    setOpen(true);
  };

  const submit = () => {
    form.submit(editing ? (data) => update(editing.id, data) : store, {
      onSuccess: () => setOpen(false),
    });
  };

  return { open, setOpen, editing, form, openCreate, openEdit, submit };
}
