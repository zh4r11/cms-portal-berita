import { ShieldX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <div role="alert" className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <ShieldX className="size-6" />
      </span>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Halaman ini tidak dapat Anda akses</h1>
        <p className="text-sm text-muted-foreground">
          Akun Anda belum diberi hak akses ke modul ini, atau data ini milik penulis lain. Minta admin menambahkan aksesnya di menu
          Manajemen User.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard">Ke dashboard</Link>
      </Button>
    </div>
  );
}
