"use client";

import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Pilih beberapa tag; nama yang belum ada bisa langsung ditambahkan dan
 * dibuat di server saat disimpan. Nilainya daftar nama tag.
 */
export default function TagPicker({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [cari, setCari] = useState("");
  const kunci = (s: string) => s.trim().toLowerCase();
  const dipilih = new Set(value.map(kunci));
  const baru = cari.trim() && ![...options, ...value].some((o) => kunci(o) === kunci(cari));

  const toggle = (nama: string) => {
    onChange(dipilih.has(kunci(nama)) ? value.filter((v) => kunci(v) !== kunci(nama)) : [...value, nama.trim()]);
  };

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id={id} type="button" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between px-3 font-normal">
            <span className={cn("truncate", !value.length && "text-muted-foreground")}>
              {value.length ? `${value.length} tag dipilih` : "Pilih tag..."}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Cari atau ketik tag baru..." value={cari} onValueChange={setCari} />
            <CommandList>
              <CommandEmpty>Tidak ada tag dengan nama itu.</CommandEmpty>
              {baru && (
                <CommandGroup>
                  <CommandItem
                    value={`__baru__${cari}`}
                    onSelect={() => {
                      toggle(cari);
                      setCari("");
                    }}
                  >
                    <Plus />
                    Tambah tag &quot;{cari.trim()}&quot;
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {[...new Set([...options, ...value])].map((nama) => (
                  <CommandItem key={nama} value={nama} onSelect={() => toggle(nama)}>
                    <Check className={cn(dipilih.has(kunci(nama)) ? "opacity-100" : "opacity-0")} />
                    {nama}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tag terpilih">
          {value.map((nama) => (
            <li key={nama}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {nama}
                <button
                  type="button"
                  onClick={() => toggle(nama)}
                  className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:p-1"
                  aria-label={`Lepas tag ${nama}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
