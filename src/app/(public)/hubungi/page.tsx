import type { Metadata } from "next";
import { JudulBagian } from "@/components/portal/judul-bagian";
import { bersihkanHtml } from "@/lib/content";
import { getTampilan } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { getIdentitas } from "@/lib/site";
import { HubungiForm } from "./hubungi-form";

export const metadata: Metadata = { title: "Hubungi kami" };

export default async function HubungiPage() {
  const [identitas, { alamat }, ym] = await Promise.all([getIdentitas(), getTampilan(), prisma.modYm.findMany({ orderBy: { nama: "asc" } })]);

  return (
    <>
      <JudulBagian as="h1">Hubungi Redaksi</JudulBagian>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-label="Kirim pesan" className="max-w-xl">
          <p className="mb-6 text-muted-foreground">Kirim kabar, koreksi berita, atau pertanyaan pemasangan iklan. Balasan dikirim ke email Anda.</p>
          <HubungiForm />
        </section>

        <section aria-label="Kontak redaksi" className="space-y-6 text-sm">
          {alamat && <div className="isi-artikel text-sm [&>*+*]:mt-1" dangerouslySetInnerHTML={{ __html: bersihkanHtml(alamat.alamat) }} />}
          <dl className="grid gap-3">
            {identitas.email && (
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>
                  <a href={`mailto:${identitas.email}`} className="underline underline-offset-4">
                    {identitas.email}
                  </a>
                </dd>
              </div>
            )}
            {identitas.noTelp && (
              <div>
                <dt className="text-muted-foreground">Telepon</dt>
                <dd>
                  <a href={`tel:${identitas.noTelp.replace(/[^\d+]/g, "")}`} className="underline underline-offset-4">
                    {identitas.noTelp}
                  </a>
                </dd>
              </div>
            )}
            {identitas.rekening && (
              <div>
                <dt className="text-muted-foreground">Rekening pemasangan iklan</dt>
                <dd>{identitas.rekening}</dd>
              </div>
            )}
            {ym.length > 0 && (
              <div>
                <dt className="text-muted-foreground">Yahoo! Messenger (arsip, layanan sudah ditutup)</dt>
                {ym.map((y) => (
                  <dd key={y.id}>
                    {y.nama}: {y.username}
                  </dd>
                ))}
              </div>
            )}
          </dl>
        </section>
      </div>
    </>
  );
}
