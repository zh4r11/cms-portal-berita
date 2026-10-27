"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "@/hooks/use-form";
import { cn } from "@/lib/utils";
import { aktifkanTemplate } from "./actions";

type Template = { id: number; judul: string; pembuat: string | null; aktif: boolean; light: string; dark: string };

export function TemplateList({ templates }: { templates: Template[] }) {
  const [pending, run] = useAction();

  return (
    <ul className="grid max-w-3xl gap-3 sm:grid-cols-3">
      {templates.map((t) => (
        <li key={t.id}>
          <Card className={cn("h-full py-4", t.aktif && "border-primary")}>
            <CardContent className="grid gap-3 px-4">
              <div className="flex gap-2" aria-hidden>
                <span className="h-10 flex-1 rounded-md" style={{ background: t.light }} />
                <span className="h-10 flex-1 rounded-md" style={{ background: t.dark }} />
              </div>
              <div>
                <p className="font-medium">{t.judul}</p>
                {t.pembuat && <p className="text-xs text-muted-foreground">Oleh {t.pembuat}</p>}
              </div>
              {t.aktif ? (
                <p className="flex h-8 items-center gap-1.5 text-sm font-medium">
                  <Check className="size-4" />
                  Sedang dipakai
                </p>
              ) : (
                <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => aktifkanTemplate(t.id))}>
                  {pending && <Spinner />}
                  Pakai template {t.judul.toLowerCase()}
                </Button>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
