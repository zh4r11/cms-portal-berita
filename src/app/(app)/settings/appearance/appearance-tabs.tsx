"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "light", icon: Sun, label: "Terang" },
  { value: "dark", icon: Moon, label: "Gelap" },
  { value: "system", icon: Monitor, label: "Sistem" },
] as const;

const subscribe = () => () => {};

export function AppearanceTabs() {
  const { theme, setTheme } = useTheme();
  // Tema baru diketahui setelah hydration; sebelum itu tidak ada tab aktif.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
      {TABS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-pressed={mounted && theme === value}
          className={cn(
            "flex items-center rounded-md px-3.5 py-1.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring pointer-coarse:py-3",
            mounted && theme === value
              ? "bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100"
              : "text-neutral-600 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60",
          )}
        >
          <Icon className="-ml-1 h-4 w-4" />
          <span className="ml-1.5 text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
}
