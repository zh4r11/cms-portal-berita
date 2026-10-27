import { sensor } from "@/lib/content";
import { formatWaktu } from "@/lib/format";
import { initials } from "@/lib/utils";

type Komentar = { id: number; nama: string; url: string | null; isi: string; createdAt: Date };

/** Komentar pembaca; teks polos, disensor dengan daftar katajelek. */
export function DaftarKomentar({ komentar, kataJelek }: { komentar: Komentar[]; kataJelek: { kata: string; ganti: string }[] }) {
  if (komentar.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada komentar. Jadilah yang pertama menanggapi.</p>;
  }

  return (
    <ul className="grid gap-5">
      {komentar.map((k) => (
        <li key={k.id} className="grid grid-cols-[2.25rem_1fr] gap-3">
          <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {initials(k.nama)}
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm">
              {k.url ? (
                <a href={k.url} target="_blank" rel="noopener noreferrer nofollow ugc" className="font-semibold hover:underline">
                  {k.nama}
                </a>
              ) : (
                <span className="font-semibold">{k.nama}</span>
              )}{" "}
              <span className="text-xs text-muted-foreground">{formatWaktu(k.createdAt)}</span>
            </p>
            <p className="text-sm break-words whitespace-pre-line">{sensor(k.isi, kataJelek)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
