import { cookies } from "next/headers";
import type { Metadata } from "next";
import { DenganSidebar } from "@/components/portal/dengan-sidebar";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { PolingWidget } from "@/components/portal/poling-widget";
import { formatAngka } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Jajak pendapat" };

export default async function PolingPage() {
  const [pertanyaan, jawaban] = await Promise.all([
    prisma.poling.findFirst({ where: { status: "pertanyaan", aktif: true } }),
    prisma.poling.findMany({ where: { status: "jawaban", aktif: true }, orderBy: [{ rating: "desc" }, { id: "asc" }] }),
  ]);
  const total = jawaban.reduce((sum, j) => sum + j.rating, 0);
  const sudahMemilih = !!pertanyaan && (await cookies()).get("poling_dipilih")?.value === String(pertanyaan.id);

  return (
    <DenganSidebar>
      <JudulBagian as="h1">Jajak Pendapat</JudulBagian>
      {!pertanyaan || jawaban.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sedang tidak ada jajak pendapat.</p>
      ) : (
        <div className="max-w-xl space-y-8">
          <section aria-labelledby="hasil" className="space-y-4">
            <h2 id="hasil" className="font-serif text-xl font-semibold">
              {pertanyaan.pilihan}
            </h2>
            <p className="text-sm text-muted-foreground">{formatAngka(total)} suara masuk</p>
            <ul className="grid gap-4">
              {jawaban.map((j) => {
                const persen = total ? Math.round((j.rating / total) * 100) : 0;

                return (
                  <li key={j.id} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                      <span>{j.pilihan}</span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {persen}% <span className="font-normal text-muted-foreground">({formatAngka(j.rating)})</span>
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                      <div className="h-full rounded-full bg-primary" style={{ width: `${persen}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
          {!sudahMemilih && (
            <section aria-label="Berikan suara" className="rounded-lg border p-4">
              <PolingWidget pertanyaan="Belum memilih? Berikan suara Anda" jawaban={jawaban} sudahMemilih={false} />
            </section>
          )}
        </div>
      )}
    </DenganSidebar>
  );
}
