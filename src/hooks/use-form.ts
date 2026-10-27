"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action";

/** Tampilkan toast dari hasil action dan ikuti `redirect` bila ada. */
export function useActionResult() {
  const router = useRouter();

  return (result: ActionResult) => {
    if (result.ok) {
      if (result.message) {
        toast.success(result.message);
      }

      if (result.redirect) {
        router.push(result.redirect);
      }
    } else if (result.message) {
      toast.error(result.message);
    }
  };
}

type SetData<T> = {
  <K extends keyof T>(key: K, value: T[K]): void;
  (values: T | ((previous: T) => T)): void;
};

/**
 * State form sederhana yang dikirim ke Server Action
 * (pengganti `useForm` Inertia di project lama).
 */
export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [defaults, setDefaults] = useState(initial);
  const [data, setDataState] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, startTransition] = useTransition();
  const handleResult = useActionResult();

  // Sengaja arrow function, bukan function declaration ber-overload:
  // React Compiler 1.0 membiarkannya `undefined` pada render pertama.
  const setData: SetData<T> = (keyOrValues: unknown, value?: unknown) => {
    if (typeof keyOrValues === "function" || typeof keyOrValues === "object") {
      setDataState(keyOrValues as T | ((previous: T) => T));
    } else {
      setDataState((previous) => ({ ...previous, [keyOrValues as keyof T]: value }));
    }
  };

  const submit = (
    action: (data: T) => Promise<ActionResult>,
    options: { onSuccess?: () => void } = {},
  ) => {
    startTransition(async () => {
      const result = await action(data);

      setErrors(result.ok ? {} : (result.errors ?? {}));
      handleResult(result);

      if (result.ok) {
        options.onSuccess?.();
      }
    });
  };

  return {
    data,
    setData,
    errors,
    setErrors,
    clearErrors: () => setErrors({}),
    processing,
    isDirty: JSON.stringify(data) !== JSON.stringify(defaults),
    reset: () => {
      setDataState(defaults);
      setErrors({});
    },
    /** Jadikan data saat ini sebagai nilai awal (setelah tersimpan). */
    setDefaults: (values: T = data) => setDefaults(values),
    submit,
  };
}

/** Jalankan action tanpa form (hapus, toggle) dengan status pending. */
export function useAction() {
  const [pending, startTransition] = useTransition();
  const handleResult = useActionResult();

  const run = (action: () => Promise<ActionResult>, onDone?: (result: ActionResult) => void) => {
    startTransition(async () => {
      const result = await action();
      handleResult(result);
      onDone?.(result);
    });
  };

  return [pending, run] as const;
}
