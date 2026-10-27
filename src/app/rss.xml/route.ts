import { ringkas } from "@/lib/content";
import { beritaTerbit } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { getIdentitas } from "@/lib/site";

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 20 berita terbaru (pengganti rss.php di versi lama). */
export async function GET(request: Request) {
  const origin = process.env.BETTER_AUTH_URL ?? new URL(request.url).origin;
  const [identitas, berita] = await Promise.all([
    getIdentitas(),
    prisma.berita.findMany({
      where: beritaTerbit(),
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: { judul: true, slug: true, isi: true, subJudul: true, publishedAt: true, kategori: { select: { nama: true } } },
    }),
  ]);

  const items = berita
    .map(
      (b) => `    <item>
      <title>${escape(b.judul)}</title>
      <link>${origin}/berita/${b.slug}</link>
      <guid>${origin}/berita/${b.slug}</guid>
      <pubDate>${b.publishedAt.toUTCString()}</pubDate>${b.kategori ? `\n      <category>${escape(b.kategori.nama)}</category>` : ""}
      <description>${escape(b.subJudul ?? ringkas(b.isi, 300))}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(identitas.namaWebsite)}</title>
    <link>${origin}</link>
    <description>${escape(identitas.metaDeskripsi ?? identitas.namaWebsite)}</description>
    <language>id</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
