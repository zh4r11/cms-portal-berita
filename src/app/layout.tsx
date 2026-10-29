import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { connection } from "next/server";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TEMA } from "@/lib/cms";
import { getIdentitas, getTema } from "@/lib/site";
import { mediaUrl } from "@/lib/media";
import { getOrigin } from "@/lib/url";
import "./globals.css";

// Keluarga Source dirancang untuk bacaan panjang di layar: serif untuk judul
// dan isi berita, sans untuk navigasi, form, dan tabel panel.
const sans = Source_Sans_3({ variable: "--font-sans", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const [identitas, origin] = await Promise.all([getIdentitas(), getOrigin()]);
  const favicon = mediaUrl("favicon", identitas.favicon);

  return {
    // Dasar tautan relatif di canonical, Open Graph, dan Twitter card.
    metadataBase: new URL(origin),
    title: { default: identitas.namaWebsite, template: `%s - ${identitas.namaWebsite}` },
    description: identitas.metaDeskripsi ?? undefined,
    keywords: identitas.metaKeyword ?? undefined,
    icons: favicon ? { icon: favicon } : undefined,
    alternates: { types: { "application/rss+xml": "/rss.xml" } },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Semua halaman membaca data terbaru (template warna, menu, isi berita) per request,
  // jadi tidak ada yang dibekukan saat build dan build tidak butuh koneksi database.
  await connection();
  const tema = TEMA[await getTema()];

  return (
    <html lang="id" className={`${sans.variable} ${serif.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Warna utama dari Template Warna yang aktif. */}
        <style>{`:root{--tema:${tema.light}}.dark{--tema:${tema.dark}}`}</style>
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
