import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Pengaturan profil" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <h1 className="sr-only">Pengaturan profil</h1>
      <ProfileForm
        key={`${user.updatedAt.getTime()}`}
        user={{
          name: user.name,
          username: user.username ?? "",
          email: user.email,
          noTelp: user.noTelp ?? "",
          image: user.image ?? null,
        }}
      />
    </>
  );
}
