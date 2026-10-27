"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "@/hooks/use-form";
import { pilihPoling } from "@/app/(public)/actions";

export function PolingWidget({
  pertanyaan,
  jawaban,
  sudahMemilih,
}: {
  pertanyaan: string;
  jawaban: { id: number; pilihan: string }[];
  sudahMemilih: boolean;
}) {
  const [pilihan, setPilihan] = useState("");
  const [pending, run] = useAction();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();

        if (pilihan) {
          run(() => pilihPoling(Number(pilihan)));
        }
      }}
    >
      <fieldset className="grid gap-3" disabled={sudahMemilih || pending}>
        <legend className="mb-3 text-sm font-medium">{pertanyaan}</legend>
        <RadioGroup value={pilihan} onValueChange={setPilihan}>
          {jawaban.map((j) => (
            <div key={j.id} className="flex items-center gap-2">
              <RadioGroupItem value={String(j.id)} id={`poling-${j.id}`} />
              <Label htmlFor={`poling-${j.id}`} className="font-normal">
                {j.pilihan}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>
      {sudahMemilih && <p className="text-xs text-muted-foreground">Suara Anda sudah tercatat.</p>}
      <div className="flex flex-wrap gap-2">
        {!sudahMemilih && (
          <Button type="submit" size="sm" disabled={!pilihan || pending}>
            {pending && <Spinner />}
            Kirim suara
          </Button>
        )}
        <Button asChild size="sm" variant="ghost">
          <Link href="/poling">Lihat hasil</Link>
        </Button>
      </div>
    </form>
  );
}
