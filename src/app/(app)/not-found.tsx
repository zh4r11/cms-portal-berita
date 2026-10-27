import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-6" />
      </span>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Data atau halaman tidak ditemukan</h1>
        <p className="text-sm text-muted-foreground">Mungkin sudah dihapus, atau alamatnya salah ketik.</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard">Ke dashboard</Link>
      </Button>
    </div>
  );
}
