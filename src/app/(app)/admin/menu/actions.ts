"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { linkValid } from "@/lib/menu-link";
import { prisma } from "@/lib/prisma";
import { requireModul } from "@/lib/session";
import { idOpsional, teks } from "@/lib/validation";

const schema = z.object({
  nama: teks("Nama menu", 50),
  parentId: idOpsional(),
  link: z.string().trim().max(200).default(""),
  urutan: z.coerce.number().int().min(0).max(999).default(0),
  aktif: z.boolean().default(true),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireModul("menu");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const d = parsed.data;
  const link = d.link || null;

  if (d.parentId) {
    const parent = await prisma.menu.findUnique({ where: { id: d.parentId } });

    if (!parent || parent.parentId || parent.id === id) {
      return fieldErrors({ parentId: "Submenu hanya bisa berada di bawah menu utama." });
    }

    if (id && (await prisma.menu.count({ where: { parentId: id } }))) {
      return fieldErrors({ parentId: "Menu ini punya submenu, jadi harus tetap menjadi menu utama." });
    }
  }

  // Submenu dan menu tanpa anak wajib punya tujuan; menu utama dengan anak boleh kosong.
  if (!link && (d.parentId || !id || !(await prisma.menu.count({ where: { parentId: id } })))) {
    return fieldErrors({ link: "Pilih tujuan menu. Tujuan boleh kosong hanya untuk menu utama yang punya submenu." });
  }

  if (link && !(await linkValid(link))) {
    return fieldErrors({ link: "Tujuan ini tidak ada di portal. Pilih dari daftar atau isi URL lengkap." });
  }

  const data = { nama: d.nama, parentId: d.parentId, link, urutan: d.urutan, aktif: d.aktif };
  await (id ? prisma.menu.update({ where: { id }, data }) : prisma.menu.create({ data }));
  refresh();

  return success(pesan);
}

export async function tambahMenu(input: unknown) {
  return simpan(null, input, "Menu berhasil ditambahkan.");
}

export async function ubahMenu(id: number, input: unknown) {
  return simpan(id, input, "Menu berhasil diperbarui.");
}

export async function aktifkanMenu(id: number, aktif: boolean): Promise<ActionResult> {
  await requireModul("menu");
  await prisma.menu.update({ where: { id }, data: { aktif } });
  refresh();

  return success(aktif ? "Menu ditampilkan." : "Menu disembunyikan.");
}

export async function hapusMenu(id: number): Promise<ActionResult> {
  await requireModul("menu");
  await prisma.menu.delete({ where: { id } });
  refresh();

  return success("Menu dan submenunya berhasil dihapus.");
}
