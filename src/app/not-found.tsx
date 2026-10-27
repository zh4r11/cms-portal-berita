import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-16 text-center">
      <p className="font-serif text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-muted-foreground">Berita atau halaman ini mungkin sudah dihapus atau alamatnya berubah.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Button asChild>
          <Link href="/">Ke beranda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/berita">Indeks berita</Link>
        </Button>
      </div>
    </div>
  );
}
