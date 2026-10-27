export { cn } from "cn";

function initial(name: string): string {
  return Array.from(name)[0] ?? "";
}

/** Inisial nama untuk avatar, mis. "Andi Yudi" → "AY". */
export function initials(fullName: string): string {
  const names = fullName.trim().split(/\s+/u).filter(Boolean);

  if (names.length === 0) {
    return "";
  }

  if (names.length === 1) {
    return initial(names[0]).toUpperCase();
  }

  return `${initial(names[0])}${initial(names[names.length - 1])}`.toUpperCase();
}
