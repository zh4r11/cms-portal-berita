import "server-only";
import { headers } from "next/headers";

const hits = new Map<string, number[]>();

/**
 * Pembatas sederhana per IP (in-memory, cukup untuk satu instance server).
 * Mengembalikan `false` bila batas terlampaui.
 */
export async function rateLimit(key: string, limit: number, windowMs = 60_000): Promise<boolean> {
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "local";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    hits.set(id, recent);

    return false;
  }

  recent.push(now);
  hits.set(id, recent);

  return true;
}
