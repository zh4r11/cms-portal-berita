import { NextResponse } from "next/server";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";

/** Hitung unduhan lalu arahkan ke file di /media/download. */
export async function GET(request: Request, { params }: RouteContext<"/download/[id]">) {
  const id = Number((await params).id);
  const download = Number.isInteger(id) ? await prisma.download.findUnique({ where: { id } }) : null;

  if (!download) {
    return NextResponse.redirect(new URL("/download", request.url));
  }

  await prisma.download.update({ where: { id }, data: { hits: { increment: 1 } } });

  return NextResponse.redirect(new URL(mediaUrl("download", download.namaFile)!, request.url));
}
