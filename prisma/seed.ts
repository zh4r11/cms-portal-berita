import { pastikanModul, pastikanTemplate, prisma, simpanAkun } from "./db";

/**
 * Data minimum agar panel bisa dipakai: akun admin, identitas situs,
 * daftar modul, dan skema warna. Konten berita diisi lewat panel
 * atau `pnpm db:import` dari dump CMS lama.
 */
async function main() {
  const adaAdmin = await prisma.user.findUnique({ where: { username: "admin" } });

  if (!adaAdmin) {
    await simpanAkun({ username: "admin", name: "Administrator", email: "admin@localhost.test", level: "admin", password: "admin" });
    console.info("Akun admin dibuat (username: admin, password: admin). Ganti password setelah login pertama.");
  }

  await prisma.identitas.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, namaWebsite: process.env.NEXT_PUBLIC_APP_NAME ?? "Portal Berita" },
  });

  await pastikanModul();
  await pastikanTemplate();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
