import "server-only";
import { cache } from "react";
import { APP_NAME, temaValid } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

/** Identitas situs (baris tunggal); bila belum di-seed, pakai nama bawaan. */
export const getIdentitas = cache(async () => {
  const identitas = await prisma.identitas.findUnique({ where: { id: 1 } });

  return (
    identitas ?? {
      id: 1,
      namaWebsite: APP_NAME,
      email: null,
      url: null,
      facebook: null,
      rekening: null,
      noTelp: null,
      metaDeskripsi: null,
      metaKeyword: null,
      favicon: null,
    }
  );
});

export const getTema = cache(async () => {
  const aktif = await prisma.template.findFirst({ where: { aktif: true }, select: { folder: true } });

  return temaValid(aktif?.folder);
});
