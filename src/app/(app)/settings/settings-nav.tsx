"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEMS = [
  { title: "Profil", href: "/settings/profile" },
  { title: "Password", href: "/settings/security" },
  { title: "Tampilan", href: "/settings/appearance" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1 space-x-0" aria-label="Pengaturan">
      {ITEMS.map((item) => (
        <Button
          key={item.href}
          size="sm"
          variant="ghost"
          asChild
          className={cn("w-full justify-start", pathname.startsWith(item.href) && "bg-muted")}
        >
          <Link href={item.href}>{item.title}</Link>
        </Button>
      ))}
    </nav>
  );
}
