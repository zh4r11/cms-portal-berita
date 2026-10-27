import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Keluarkan pengguna lalu arahkan ke login. Dipakai saat akun
 * ternyata sudah dinonaktifkan admin (Server Component tidak bisa
 * menghapus cookie sendiri).
 */
export async function GET(request: NextRequest) {
  const result = await auth.api.signOut({ headers: request.headers, asResponse: true });

  const status = request.nextUrl.searchParams.get("status");
  const target = new URL(status ? `/login?status=${encodeURIComponent(status)}` : "/login", request.url);
  const response = NextResponse.redirect(target);

  for (const cookie of result.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}
