import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getIdentitas } from "@/lib/site";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const [session, identitas] = await Promise.all([getSession(), getIdentitas()]);

  if (session && !session.user.blokir) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <Link
            href="/"
            className="self-center rounded-sm text-center font-serif text-2xl font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            {identitas.namaWebsite}
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
