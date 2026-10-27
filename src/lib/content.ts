import sanitize from "sanitize-html";

/** Slug URL dari judul, mis. "Banjir Jakarta Lagi!" → "banjir-jakarta-lagi". */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150) || "tanpa-judul";
}

/**
 * Cari slug yang belum dipakai: "judul", lalu "judul-2", "judul-3", dst.
 * `exists` memeriksa ke tabel yang bersangkutan.
 */
export async function slugUnik(text: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const base = slugify(text);
  let slug = base;

  for (let i = 2; await exists(slug); i++) {
    slug = `${base}-${i}`;
  }

  return slug;
}

/**
 * Isi artikel dari editor (dan hasil impor TinyMCE lama) dibersihkan sebelum
 * dirender: hanya tag format teks, tautan, gambar, dan tabel yang diizinkan.
 */
export function bersihkanHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      ...sanitize.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "iframe",
      "u",
      "s",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "allowfullscreen", "title"],
      "*": ["style"],
    },
    allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
      a: sanitize.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

/** Ringkasan teks polos dari HTML untuk kutipan daftar berita. */
export function ringkas(html: string, panjang = 180): string {
  const teks = sanitize(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (teks.length <= panjang) {
    return teks;
  }

  return `${teks.slice(0, teks.lastIndexOf(" ", panjang) || panjang)}...`;
}

/** Sensor kata pada komentar pembaca (tabel katajelek), tanpa peduli huruf besar/kecil. */
export function sensor(teks: string, daftar: { kata: string; ganti: string }[]): string {
  return daftar.reduce((hasil, { kata, ganti }) => {
    const pola = new RegExp(`\\b${kata.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");

    return hasil.replace(pola, ganti);
  }, teks);
}
