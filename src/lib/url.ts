import "server-only";
import { headers } from "next/headers";

/**
 * Alamat situs untuk tautan absolut (bagikan, canonical, JSON-LD).
 * BETTER_AUTH_URL sudah wajib diisi dengan alamat publik, sama seperti RSS;
 * tanpa itu dipakai host dari request.
 */
export async function getOrigin(): Promise<string> {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL.replace(/\/+$/, "");
  }

  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const proto = list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
