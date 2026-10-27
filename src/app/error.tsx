"use client";

import { ErrorState } from "@/components/page-state";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorState error={error} retry={retry} backHref="/" backLabel="Ke beranda" />;
}
