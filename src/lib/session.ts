import "server-only";
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { MODUL_KEYS, type ModulKey } from "@/lib/modul";
import { prisma } from "@/lib/prisma";

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/**
 * Pengguna yang sedang login. Tanpa sesi diarahkan ke login;
 * akun yang diblokir admin dikeluarkan.
 */
export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.blokir) {
    redirect("/logout?status=diblokir");
  }

  return session.user;
}

export type CurrentUser = Awaited<ReturnType<typeof requireUser>>;

/**
 * Modul yang boleh dibuka pengguna. Admin membuka semua modul; level user
 * hanya modul aktif berstatus `user` yang diberikan lewat users_modul
 * (sama seperti fungsi user_akses di versi lama).
 */
export const getAkses = cache(async (): Promise<Set<ModulKey>> => {
  const user = await requireUser();

  if (user.level === "admin") {
    return new Set(MODUL_KEYS);
  }

  const rows = await prisma.userModul.findMany({
    where: { userId: user.id, modul: { aktif: true, status: "user" } },
    select: { modul: { select: { link: true } } },
  });

  return new Set(rows.map((row) => row.modul.link as ModulKey));
});

/** Hentikan halaman atau action bila pengguna tidak punya akses ke modul. */
export async function requireModul(key: ModulKey) {
  const user = await requireUser();
  const akses = await getAkses();

  if (!akses.has(key)) {
    forbidden();
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.level !== "admin") {
    forbidden();
  }

  return user;
}
