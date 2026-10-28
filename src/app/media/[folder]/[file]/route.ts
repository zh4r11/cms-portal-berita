import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { FOLDER, pakaiSupabase, STORAGE_DIR, urlPublikSupabase, type Folder } from "@/lib/storage";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

/** File unggahan dari storage/<folder>/<file>. Mendukung Range agar video bisa di-seek. */
export async function GET(request: Request, { params }: RouteContext<"/media/[folder]/[file]">) {
  const { folder, file } = await params;
  const nama = decodeURIComponent(file);

  if (!(FOLDER as readonly string[]).includes(folder) || nama.includes("/") || nama.includes("\\") || nama.startsWith(".")) {
    return new Response("Not found", { status: 404 });
  }

  if (pakaiSupabase) {
    return proxySupabase(request, folder as Folder, nama);
  }

  const lokasi = path.join(STORAGE_DIR, folder, nama);
  const info = await stat(lokasi).catch(() => null);

  if (!info?.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": MIME[path.extname(nama).toLowerCase()] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    // Nama file unggahan selalu diberi awalan acak, jadi aman di-cache lama.
    "Cache-Control": "public, max-age=604800",
    "X-Content-Type-Options": "nosniff",
  });

  const range = request.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);

  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;

    if (start >= info.size || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    }

    headers.set("Content-Range", `bytes ${start}-${end}/${info.size}`);
    headers.set("Content-Length", String(end - start + 1));

    return new Response(Readable.toWeb(createReadStream(lokasi, { start, end })) as ReadableStream, { status: 206, headers });
  }

  headers.set("Content-Length", String(info.size));

  return new Response(Readable.toWeb(createReadStream(lokasi)) as ReadableStream, { headers });
}

/** Teruskan file dari bucket Supabase dengan header yang sama seperti file lokal. */
async function proxySupabase(request: Request, folder: Folder, nama: string) {
  const range = request.headers.get("range");
  const res = await fetch(urlPublikSupabase(folder, nama), { headers: range ? { range } : {} });

  if (!res.ok || !res.body) {
    return new Response("Not found", { status: res.status === 416 ? 416 : 404 });
  }

  const headers = new Headers({
    "Content-Type": MIME[path.extname(nama).toLowerCase()] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=604800",
    "X-Content-Type-Options": "nosniff",
  });

  for (const kunci of ["content-length", "content-range"]) {
    const nilai = res.headers.get(kunci);

    if (nilai) {
      headers.set(kunci, nilai);
    }
  }

  return new Response(res.body, { status: res.status, headers });
}
