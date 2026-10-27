"use client";

import { ChevronDown, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type MenuItem = { id: number; nama: string; link: string | null; children: { id: number; nama: string; link: string }[] };

function MenuLink({ href, className, children, onClick }: { href: string; className?: string; children: React.ReactNode; onClick?: () => void }) {
  return /^https?:\/\//.test(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

const ITEM =
  "inline-flex h-11 items-center gap-1 px-3 text-sm font-medium text-foreground/80 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring rounded-sm";

export function PortalNav({ menu }: { menu: MenuItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const aktif = (href: string | null) => !!href && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const items = menu.some((m) => m.link === "/") ? menu : [{ id: 0, nama: "Beranda", link: "/", children: [] }, ...menu];

  return (
    <nav aria-label="Menu utama" className="flex items-center gap-2">
      <ul className="hidden min-w-0 flex-1 flex-wrap items-center lg:flex">
        {items.map((m) =>
          m.children.length ? (
            <li key={m.id}>
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(ITEM, m.children.some((c) => aktif(c.link)) && "text-primary")}>
                  {m.nama}
                  <ChevronDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {m.link && (
                    <DropdownMenuItem asChild>
                      <MenuLink href={m.link}>Semua {m.nama}</MenuLink>
                    </DropdownMenuItem>
                  )}
                  {m.children.map((c) => (
                    <DropdownMenuItem key={c.id} asChild>
                      <MenuLink href={c.link}>{c.nama}</MenuLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ) : (
            <li key={m.id}>
              <MenuLink href={m.link!} className={cn(ITEM, aktif(m.link) && "text-primary")}>
                <span aria-current={aktif(m.link) ? "page" : undefined}>{m.nama}</span>
              </MenuLink>
            </li>
          ),
        )}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="h-11 lg:hidden">
            <Menu />
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <CariForm onDone={() => setOpen(false)} />
          </div>
          <ul className="grid px-2 pb-6">
            {items.map((m) => (
              <li key={m.id}>
                {m.link ? (
                  <MenuLink href={m.link} onClick={() => setOpen(false)} className={cn(ITEM, "w-full", aktif(m.link) && "text-primary")}>
                    {m.nama}
                  </MenuLink>
                ) : (
                  <p className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground">{m.nama}</p>
                )}
                {m.children.length > 0 && (
                  <ul className="grid pl-3">
                    {m.children.map((c) => (
                      <li key={c.id}>
                        <MenuLink href={c.link} onClick={() => setOpen(false)} className={cn(ITEM, "w-full font-normal", aktif(c.link) && "text-primary")}>
                          {c.nama}
                        </MenuLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <div className="ml-auto hidden w-56 lg:block">
        <CariForm />
      </div>
    </nav>
  );
}

export function CariForm({ defaultValue = "", onDone }: { defaultValue?: string; onDone?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();

        if (q.trim()) {
          router.push(`/cari?q=${encodeURIComponent(q.trim())}`);
          onDone?.();
        }
      }}
    >
      <label htmlFor={onDone ? "cari-mobile" : "cari"} className="sr-only">
        Cari berita
      </label>
      <Input
        id={onDone ? "cari-mobile" : "cari"}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari berita..."
        className="pr-10"
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
      >
        <Search className="size-4" />
        <span className="sr-only">Cari</span>
      </button>
    </form>
  );
}
