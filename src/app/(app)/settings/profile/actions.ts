"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { isSuperAdmin } from "@/lib/cms";
import { mediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { prosesUpload } from "@/lib/upload";
import { emailSchema, teks, teksOpsional, usernameSchema } from "@/lib/validation";

const schema = z.object({
  name: teks("Nama"),
  username: usernameSchema,
  email: emailSchema,
  noTelp: teksOpsional("No. telepon", 30),
  hapus_avatar: z.enum(["0", "1"]).default("0"),
});

/** Nama file foto dari kolom image (/media/user/<nama>). */
function namaFoto(image: string | null | undefined) {
  return image?.startsWith("/media/user/") ? decodeURIComponent(image.slice("/media/user/".length)) : null;
}

/** Perbarui nama, username, email, telepon, dan foto profil (FormData karena ada file). */
export async function perbaruiProfil(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = schema.safeParse(Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")));

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const { name, username, email, noTelp, hapus_avatar } = parsed.data;
  const errors: Record<string, string> = {};

  if (isSuperAdmin(user.username) && username !== user.username) {
    errors.username = "Username akun admin utama tidak dapat diubah.";
  }

  const [usernameDipakai, emailDipakai] = await Promise.all([
    prisma.user.count({ where: { username, NOT: { id: user.id } } }),
    prisma.user.count({ where: { email, NOT: { id: user.id } } }),
  ]);
  if (usernameDipakai) errors.username = "Username sudah digunakan.";
  if (emailDipakai) errors.email = "Email sudah digunakan.";

  if (Object.keys(errors).length) {
    return fieldErrors(errors);
  }

  const foto = await prosesUpload({
    file: formData.get("avatar"),
    hapus: hapus_avatar === "1",
    lama: namaFoto(user.image),
    folder: "user",
    label: "Foto",
  });

  if ("error" in foto) {
    return fieldErrors({ avatar: foto.error });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      username,
      displayUsername: username,
      email,
      noTelp,
      ...(foto.nama !== undefined && { image: mediaUrl("user", foto.nama) }),
    },
  });
  await foto.selesai();

  refresh();

  return success("Profil berhasil diperbarui.");
}
