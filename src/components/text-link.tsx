import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export default function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "rounded-sm text-foreground underline decoration-neutral-300 underline-offset-4 outline-none transition-colors duration-300 ease-out hover:decoration-current! focus-visible:ring-3 focus-visible:ring-ring dark:decoration-neutral-500",
        className,
      )}
      {...props}
    />
  );
}
