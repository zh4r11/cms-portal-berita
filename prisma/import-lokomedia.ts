/**
 * Impor data dari CMS Lokomedia lama (PHP/MySQL) ke database ini.
 *
 *   pnpm db:import "E:\path\ke\CMS Portal Berita"
 *
 * Membaca file .sql di folder tersebut dan menyalin foto dari folder
 * foto_berita, img_galeri, dst. ke storage/. Data CMS yang sudah ada di
 * database dihapus lebih dulu; akun dicocokkan berdasarkan username.
 */
import { copyFile, mkdir, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { Level } from "../src/generated/prisma/client";
import { slugify } from "../src/lib/content";
import { youtubeId } from "../src/lib/media";
import { isModulKey, type ModulKey } from "../src/lib/modul";
import { STORAGE_DIR_SCRIPT, type FolderScript } from "./storage-path";
import { pastikanModul, pastikanTemplate, prisma, simpanAkun } from "./db";
import { parseDump, type Row } from "./mysql-dump";

const legacyDir = process.argv[2] ?? process.env.LEGACY_DIR;

if (!legacyDir) {
  console.error('Pakai: pnpm db:import "<folder CMS lama>"');
  process.exit(1);
}

const log = (pesan: string) => console.info(pesan);
const dilewati: string[] = [];

const str = (row: Row, key: string) => String(row[key] ?? "").trim();
const num = (row: Row, key: string) => Number(row[key] ?? 0) || 0;
const yes = (row: Row, key: string) => ["Y", "Ya"].includes(str(row, key));
const opt = (row: Row, key: string) => str(row, key) || null;

/** Tanggal "0000-00-00" dari MySQL lama dianggap tidak ada. */
function tanggal(row: Row, key: string, jamKey?: string): Date | null {
  const t = str(row, key);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(t) || t.startsWith("0000")) {
    return null;
  }

  const jam = jamKey && /^\d{2}:\d{2}(:\d{2})?$/.test(str(row, jamKey)) ? str(row, jamKey) : "00:00:00";

  return new Date(`${t}T${jam.length === 5 ? `${jam}:00` : jam}+07:00`);
}

function tanggalDb(row: Row, key: string): Date | null {
  const t = str(row, key);

  return /^\d{4}-\d{2}-\d{2}$/.test(t) && !t.startsWith("0000") ? new Date(`${t}T00:00:00Z`) : null;
}

async function ada(file: string) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

/** Salin foto lama ke storage/<folder>. Mengembalikan nama file, atau null bila tidak ditemukan. */
async function salin(sumber: string, nama: string | null, folder: FolderScript): Promise<string | null> {
  if (!nama) {
    return null;
  }

  const asal = path.join(legacyDir!, sumber, nama);

  if (!(await ada(asal))) {
    return null;
  }

  const tujuan = path.join(STORAGE_DIR_SCRIPT, folder);
  await mkdir(tujuan, { recursive: true });
  await copyFile(asal, path.join(tujuan, nama));

  return nama;
}

function unik(slugs: Set<string>, value: string) {
  const base = slugify(value);
  let slug = base;

  for (let i = 2; slugs.has(slug); i++) {
    slug = `${base}-${i}`;
  }

  slugs.add(slug);

  return slug;
}

/** Link menu lama (kategori-48-hukum.html, index.php, ...) ke path aplikasi ini. */
function linkMenu(link: string, kategori: Map<number, string>): string | null {
  const kat = link.match(/^kategori-(\d+)-/);

  if (kat) {
    const slug = kategori.get(Number(kat[1]));

    return slug ? `/kategori/${slug}` : null;
  }

  const peta: Record<string, string> = {
    "index.php": "/",
    "semua-playlist.html": "/video",
    "semua-agenda.html": "/agenda",
    "semua-album.html": "/galeri",
    "semua-berita.html": "/berita",
    "semua-download.html": "/download",
    "hubungi-kami.html": "/hubungi",
  };

  if (peta[link]) {
    return peta[link];
  }

  return /^https?:\/\//.test(link) ? link : null;
}

/** Modul lama (?module=xxx) ke kunci modul di src/lib/modul.ts. */
function kunciModul(link: string): ModulKey | null {
  const nama = link.replace("?module=", "");
  const peta: Record<string, ModulKey> = {
    user: "users",
    galerifoto: "galeri",
    menuutama: "menu",
    submenu: "menu",
    halamanstatis: "halaman",
    tagvid: "tagvideo",
    komentarvid: "komentarvideo",
  };

  const key = peta[nama] ?? nama;

  return isModulKey(key) ? key : null;
}

async function cariDump(): Promise<string> {
  const file = (await readdir(legacyDir!)).find((name) => name.toLowerCase().endsWith(".sql"));

  if (!file) {
    throw new Error(`Tidak ada file .sql di ${legacyDir}`);
  }

  return path.join(legacyDir!, file);
}

async function kosongkan() {
  // Urutan anak dulu, baru induk.
  await prisma.$transaction([
    prisma.komentar.deleteMany(),
    prisma.komentarVideo.deleteMany(),
    prisma.berita.deleteMany(),
    prisma.video.deleteMany(),
    prisma.galeri.deleteMany(),
    prisma.album.deleteMany(),
    prisma.playlist.deleteMany(),
    prisma.kategori.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.tagVideo.deleteMany(),
    prisma.halamanStatis.deleteMany(),
    prisma.agenda.deleteMany(),
    prisma.poling.deleteMany(),
    prisma.hubungi.deleteMany(),
    prisma.download.deleteMany(),
    prisma.statistik.deleteMany(),
    prisma.member.deleteMany(),
    prisma.menu.deleteMany(),
    prisma.template.deleteMany(),
    prisma.logo.deleteMany(),
    prisma.background.deleteMany(),
    prisma.header.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.iklanAtas.deleteMany(),
    prisma.iklanTengah.deleteMany(),
    prisma.pasangIklan.deleteMany(),
    prisma.sekilasInfo.deleteMany(),
    prisma.modAlamat.deleteMany(),
    prisma.modYm.deleteMany(),
    prisma.kataJelek.deleteMany(),
    prisma.userModul.deleteMany(),
  ]);
}

/** Setelah insert dengan id eksplisit, sequence autoincrement disejajarkan. */
async function setelSequence(tabel: string) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${tabel}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tabel}"), 0) + 1, false)`,
  );
}

async function main() {
  const dumpPath = await cariDump();
  log(`Membaca ${dumpPath}`);
  const data = parseDump(await readFile(dumpPath, "latin1"));
  const t = (name: string) => data.get(name) ?? [];

  await kosongkan();

  // --- Akun ------------------------------------------------------------
  const userId = new Map<string, string>();
  const sessionUser = new Map<string, string>();

  for (const row of t("users")) {
    const image = await salin("foto_user", opt(row, "foto"), "user");
    const id = await simpanAkun({
      username: str(row, "username"),
      name: str(row, "nama_lengkap") || str(row, "username"),
      email: str(row, "email") || `${str(row, "username").toLowerCase()}@localhost.test`,
      level: (str(row, "level") === "admin" ? "admin" : "user") as Level,
      blokir: yes(row, "blokir"),
      noTelp: opt(row, "no_telp"),
      image: image ? `/media/user/${encodeURIComponent(image)}` : null,
      passwordHash: str(row, "password"),
    });
    userId.set(str(row, "username").toLowerCase(), id);
    sessionUser.set(str(row, "id_session"), id);
  }
  const author = (row: Row) => userId.get(str(row, "username").toLowerCase()) ?? null;
  log(`Akun: ${userId.size}`);

  // --- Modul & hak akses ----------------------------------------------
  await pastikanModul();
  const modulLama = new Map<number, ModulKey>();

  for (const row of t("modul")) {
    const key = kunciModul(str(row, "link"));

    if (!key) {
      continue;
    }

    // Menu Utama dan Sub Menu lama digabung menjadi satu modul Menu Website.
    const gabungan = [...modulLama.values()].includes(key);
    modulLama.set(num(row, "id_modul"), key);

    if (gabungan || key === "menu") {
      continue;
    }

    await prisma.modul.update({
      where: { link: key },
      data: { nama: str(row, "nama_modul") || undefined, urutan: num(row, "urutan"), aktif: yes(row, "aktif") },
    });
  }

  const modulId = new Map((await prisma.modul.findMany()).map((m) => [m.link, m.id]));
  const akses = new Set<string>();

  for (const row of t("users_modul")) {
    const user = sessionUser.get(str(row, "id_session"));
    const key = modulLama.get(num(row, "id_modul"));
    const id = key && modulId.get(key);

    if (user && id && !akses.has(`${user}:${id}`)) {
      akses.add(`${user}:${id}`);
      await prisma.userModul.create({ data: { userId: user, modulId: id } });
    }
  }
  log(`Hak akses modul: ${akses.size}`);

  // --- Berita -----------------------------------------------------------
  const kategoriSlug = new Map<number, string>();
  const slugKategori = new Set<string>();

  for (const row of t("kategori")) {
    const slug = unik(slugKategori, str(row, "kategori_seo") || str(row, "nama_kategori"));
    kategoriSlug.set(num(row, "id_kategori"), slug);
    await prisma.kategori.create({
      data: {
        id: num(row, "id_kategori"),
        nama: str(row, "nama_kategori"),
        slug,
        aktif: yes(row, "aktif"),
        authorId: author(row),
      },
    });
  }

  const slugTag = new Set<string>();
  for (const row of t("tag")) {
    const slug = str(row, "tag_seo") || slugify(str(row, "nama_tag"));

    if (slugTag.has(slug)) {
      continue;
    }

    slugTag.add(slug);
    await prisma.tag.create({ data: { id: num(row, "id_tag"), nama: str(row, "nama_tag"), slug } });
  }

  const slugBerita = new Set<string>();
  let fotoHilang = 0;

  for (const row of t("berita")) {
    const gambar = await salin("foto_berita", opt(row, "gambar"), "berita");
    fotoHilang += opt(row, "gambar") && !gambar ? 1 : 0;
    const tags = str(row, "tag")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => slugTag.has(s));
    const kategoriId = num(row, "id_kategori");

    await prisma.berita.create({
      data: {
        id: num(row, "id_berita"),
        kategoriId: kategoriSlug.has(kategoriId) ? kategoriId : null,
        authorId: author(row),
        judul: str(row, "judul"),
        subJudul: opt(row, "sub_judul"),
        slug: unik(slugBerita, str(row, "judul_seo") || str(row, "judul")),
        youtube: youtubeId(str(row, "youtube")),
        headline: yes(row, "headline"),
        aktif: yes(row, "aktif"),
        utama: yes(row, "utama"),
        isi: str(row, "isi_berita"),
        gambar,
        keteranganGambar: opt(row, "keterangan_gambar"),
        dibaca: num(row, "dibaca"),
        publishedAt: tanggal(row, "tanggal", "jam") ?? new Date(),
        tags: { connect: [...new Set(tags)].map((slug) => ({ slug })) },
      },
    });
  }
  log(`Berita: ${t("berita").length} (foto tidak ditemukan: ${fotoHilang})`);

  const idBerita = new Set(t("berita").map((row) => num(row, "id_berita")));
  for (const row of t("komentar")) {
    if (!idBerita.has(num(row, "id_berita"))) {
      continue;
    }

    await prisma.komentar.create({
      data: {
        id: num(row, "id_komentar"),
        beritaId: num(row, "id_berita"),
        nama: str(row, "nama_komentar") || "Anonim",
        email: opt(row, "email"),
        url: opt(row, "url"),
        isi: str(row, "isi_komentar"),
        aktif: yes(row, "aktif"),
        createdAt: tanggal(row, "tgl", "jam_komentar") ?? new Date(),
      },
    });
  }

  for (const row of t("katajelek")) {
    await prisma.kataJelek.create({ data: { id: num(row, "id_jelek"), kata: str(row, "kata"), ganti: str(row, "ganti") } });
  }

  // --- Halaman & agenda -----------------------------------------------
  const slugHalaman = new Set<string>();
  for (const row of t("halamanstatis")) {
    await prisma.halamanStatis.create({
      data: {
        id: num(row, "id_halaman"),
        judul: str(row, "judul"),
        slug: unik(slugHalaman, str(row, "judul_seo") || str(row, "judul")),
        isi: str(row, "isi_halaman"),
        gambar: await salin("foto_statis", opt(row, "gambar"), "halaman"),
        dibaca: num(row, "dibaca"),
        authorId: author(row),
        createdAt: tanggal(row, "tgl_posting", "jam") ?? new Date(),
      },
    });
  }

  const slugAgenda = new Set<string>();
  for (const row of t("agenda")) {
    const mulai = tanggalDb(row, "tgl_mulai") ?? tanggalDb(row, "tgl_posting") ?? new Date();

    await prisma.agenda.create({
      data: {
        id: num(row, "id_agenda"),
        tema: str(row, "tema"),
        slug: unik(slugAgenda, str(row, "tema_seo") || str(row, "tema")),
        isi: str(row, "isi_agenda"),
        tempat: str(row, "tempat"),
        pengirim: str(row, "pengirim"),
        gambar: await salin("foto_agenda", opt(row, "gambar"), "agenda"),
        tglMulai: mulai,
        tglSelesai: tanggalDb(row, "tgl_selesai") ?? mulai,
        jam: str(row, "jam"),
        dibaca: num(row, "dibaca"),
        authorId: author(row),
        createdAt: tanggal(row, "tgl_posting") ?? new Date(),
      },
    });
  }

  // --- Foto -----------------------------------------------------------
  const slugAlbum = new Set<string>();
  for (const row of t("album")) {
    await prisma.album.create({
      data: {
        id: num(row, "id_album"),
        judul: str(row, "jdl_album"),
        slug: unik(slugAlbum, str(row, "album_seo") || str(row, "jdl_album")),
        keterangan: opt(row, "keterangan"),
        gambar: await salin("img_album", opt(row, "gbr_album"), "album"),
        aktif: yes(row, "aktif"),
        dilihat: num(row, "hits_album"),
        authorId: author(row),
        createdAt: tanggal(row, "tgl_posting", "jam") ?? new Date(),
      },
    });
  }

  const idAlbum = new Set(t("album").map((row) => num(row, "id_album")));
  for (const row of t("gallery")) {
    const gambar = await salin("img_galeri", opt(row, "gbr_gallery"), "galeri");

    if (!gambar || !idAlbum.has(num(row, "id_album"))) {
      dilewati.push(`gallery #${num(row, "id_gallery")}: foto atau album tidak ditemukan`);
      continue;
    }

    await prisma.galeri.create({
      data: {
        id: num(row, "id_gallery"),
        albumId: num(row, "id_album"),
        judul: str(row, "jdl_gallery"),
        keterangan: opt(row, "keterangan"),
        gambar,
        authorId: author(row),
      },
    });
  }

  // --- Video ----------------------------------------------------------
  const slugPlaylist = new Set<string>();
  for (const row of t("playlist")) {
    await prisma.playlist.create({
      data: {
        id: num(row, "id_playlist"),
        judul: str(row, "jdl_playlist"),
        slug: unik(slugPlaylist, str(row, "playlist_seo") || str(row, "jdl_playlist")),
        gambar: await salin("img_playlist", opt(row, "gbr_playlist"), "playlist"),
        aktif: yes(row, "aktif"),
        authorId: author(row),
      },
    });
  }

  const slugTagVid = new Set<string>();
  for (const row of t("tagvid")) {
    const slug = str(row, "tag_seo") || slugify(str(row, "nama_tag"));

    if (slugTagVid.has(slug)) {
      continue;
    }

    slugTagVid.add(slug);
    await prisma.tagVideo.create({ data: { id: num(row, "id_tag"), nama: str(row, "nama_tag"), slug } });
  }

  const idPlaylist = new Set(t("playlist").map((row) => num(row, "id_playlist")));
  const slugVideo = new Set<string>();
  for (const row of t("video")) {
    const tags = str(row, "tagvid")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => slugTagVid.has(s));

    await prisma.video.create({
      data: {
        id: num(row, "id_video"),
        playlistId: idPlaylist.has(num(row, "id_playlist")) ? num(row, "id_playlist") : null,
        judul: str(row, "jdl_video"),
        slug: unik(slugVideo, str(row, "video_seo") || str(row, "jdl_video")),
        keterangan: opt(row, "keterangan"),
        gambar: await salin("img_video", opt(row, "gbr_video"), "video"),
        file: await salin("img_video", opt(row, "video"), "videofile"),
        youtube: youtubeId(str(row, "youtube")),
        dilihat: num(row, "dilihat"),
        authorId: author(row),
        publishedAt: tanggal(row, "tanggal", "jam") ?? new Date(),
        tags: { connect: [...new Set(tags)].map((slug) => ({ slug })) },
      },
    });
  }

  const idVideo = new Set(t("video").map((row) => num(row, "id_video")));
  for (const row of t("komentarvid")) {
    if (!idVideo.has(num(row, "id_video"))) {
      continue;
    }

    await prisma.komentarVideo.create({
      data: {
        id: num(row, "id_komentar"),
        videoId: num(row, "id_video"),
        nama: str(row, "nama_komentar") || "Anonim",
        url: opt(row, "url"),
        isi: str(row, "isi_komentar"),
        aktif: yes(row, "aktif"),
        createdAt: tanggal(row, "tgl", "jam_komentar") ?? new Date(),
      },
    });
  }

  // --- Interaksi ------------------------------------------------------
  for (const row of t("poling")) {
    await prisma.poling.create({
      data: {
        id: num(row, "id_poling"),
        pilihan: str(row, "pilihan"),
        status: str(row, "status").toLowerCase() === "pertanyaan" ? "pertanyaan" : "jawaban",
        rating: num(row, "rating"),
        aktif: yes(row, "aktif"),
      },
    });
  }

  for (const row of t("hubungi")) {
    await prisma.hubungi.create({
      data: {
        id: num(row, "id_hubungi"),
        nama: str(row, "nama"),
        email: str(row, "email"),
        subjek: str(row, "subjek"),
        pesan: str(row, "pesan"),
        dibaca: yes(row, "dibaca"),
        createdAt: tanggal(row, "tanggal", "jam") ?? new Date(),
      },
    });
  }

  for (const row of t("download")) {
    const file = await salin("files", opt(row, "nama_file"), "download");

    if (!file) {
      dilewati.push(`download "${str(row, "judul")}": file ${str(row, "nama_file")} tidak ditemukan`);
      continue;
    }

    await prisma.download.create({
      data: {
        id: num(row, "id_download"),
        judul: str(row, "judul"),
        namaFile: file,
        hits: num(row, "hits"),
        createdAt: tanggal(row, "tgl_posting") ?? new Date(),
      },
    });
  }

  const statistik = new Map<string, { ip: string; tanggal: Date; hits: number; online: Date }>();
  for (const row of t("statistik")) {
    const tgl = tanggalDb(row, "tanggal");

    if (!tgl) {
      continue;
    }

    const key = `${str(row, "ip")}|${str(row, "tanggal")}`;
    const lama = statistik.get(key);
    const online = new Date(num(row, "online") * 1000 || tgl.getTime());
    statistik.set(key, {
      ip: str(row, "ip"),
      tanggal: tgl,
      hits: (lama?.hits ?? 0) + num(row, "hits"),
      online,
    });
  }
  await prisma.statistik.createMany({ data: [...statistik.values()] });

  // Tabel member di dump lama tidak berisi data; password lama (MD5) tetap disalin bila ada.
  for (const row of t("member")) {
    await prisma.member.create({
      data: {
        id: num(row, "id_member"),
        nama: str(row, "nama"),
        email: str(row, "email"),
        username: str(row, "username"),
        password: str(row, "password"),
      },
    });
  }

  // --- Tampilan situs --------------------------------------------------
  for (const row of t("identitas").slice(0, 1)) {
    const data = {
      namaWebsite: str(row, "nama_website"),
      email: opt(row, "email"),
      url: opt(row, "url"),
      facebook: opt(row, "facebook"),
      rekening: opt(row, "rekening"),
      noTelp: opt(row, "no_telp"),
      metaDeskripsi: opt(row, "meta_deskripsi"),
      metaKeyword: opt(row, "meta_keyword"),
      favicon: await salin("", opt(row, "favicon"), "favicon"),
    };
    await prisma.identitas.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  }

  const menuRows = t("menu");
  const idMenu = new Set(menuRows.map((row) => num(row, "id_menu")));
  // Induk dulu agar relasi parent_id terpenuhi.
  for (const row of [...menuRows].sort((a, b) => num(a, "id_parent") - num(b, "id_parent"))) {
    const parent = num(row, "id_parent");
    const link = linkMenu(str(row, "link"), kategoriSlug);
    const punyaAnak = menuRows.some((r) => num(r, "id_parent") === num(row, "id_menu"));

    if (!link && !punyaAnak) {
      dilewati.push(`menu "${str(row, "nama_menu")}": link ${str(row, "link") || "(kosong)"} tidak punya padanan`);
      continue;
    }

    await prisma.menu.create({
      data: {
        id: num(row, "id_menu"),
        parentId: parent && idMenu.has(parent) ? parent : null,
        nama: str(row, "nama_menu").replace(/^\+\s*/, ""),
        link: punyaAnak ? null : link,
        aktif: yes(row, "aktif"),
        urutan: num(row, "id_menu"),
      },
    });
  }

  for (const row of t("templates")) {
    const folder = str(row, "folder").replace("layout/", "");

    if (!["merah", "biru", "hijau"].includes(folder)) {
      dilewati.push(`template "${str(row, "judul")}": folder ${str(row, "folder")} tidak dikenal`);
      continue;
    }

    await prisma.template.create({
      data: { id: num(row, "id_templates"), judul: str(row, "judul"), pembuat: opt(row, "pembuat"), folder, aktif: yes(row, "aktif") },
    });
  }
  await pastikanTemplate();

  const gambarSaja = [
    { tabel: "logo", sumber: "logo", folder: "logo", kolom: "id_logo", buat: (id: number, gambar: string) => prisma.logo.create({ data: { id, gambar } }) },
    { tabel: "background", sumber: "img_background", folder: "background", kolom: "id_background", buat: (id: number, gambar: string) => prisma.background.create({ data: { id, gambar } }) },
  ] as const;

  for (const item of gambarSaja) {
    for (const row of t(item.tabel)) {
      const gambar = await salin(item.sumber, opt(row, "gambar"), item.folder);

      if (!gambar) {
        dilewati.push(`${item.tabel}: file ${str(row, "gambar")} tidak ditemukan`);
        continue;
      }

      await item.buat(num(row, item.kolom), gambar);
    }
  }

  const iklan = [
    { tabel: "header", sumber: "header", folder: "header", kolom: "id_header", model: prisma.header },
    { tabel: "banner", sumber: "foto_banner", folder: "banner", kolom: "id_banner", model: prisma.banner },
    { tabel: "iklanatas", sumber: "foto_iklanatas", folder: "iklanatas", kolom: "id_iklanatas", model: prisma.iklanAtas },
    { tabel: "iklantengah", sumber: "foto_iklantengah", folder: "iklantengah", kolom: "id_iklantengah", model: prisma.iklanTengah },
    { tabel: "pasangiklan", sumber: "foto_pasangiklan", folder: "pasangiklan", kolom: "id_pasangiklan", model: prisma.pasangIklan },
  ] as const;

  for (const item of iklan) {
    for (const row of t(item.tabel)) {
      const gambar = await salin(item.sumber, opt(row, "gambar"), item.folder);

      if (!gambar) {
        dilewati.push(`${item.tabel} "${str(row, "judul")}": file ${str(row, "gambar")} tidak ditemukan`);
        continue;
      }

      const data = {
        id: num(row, item.kolom),
        judul: str(row, "judul"),
        url: opt(row, "url"),
        gambar,
        createdAt: tanggal(row, "tgl_posting") ?? new Date(),
      };
      // Kelima model punya kolom yang sama.
      await (item.model as typeof prisma.banner).create({ data });
    }
  }

  for (const row of t("sekilasinfo")) {
    await prisma.sekilasInfo.create({
      data: {
        id: num(row, "id_sekilas"),
        info: str(row, "info"),
        gambar: await salin("foto_info", opt(row, "gambar"), "sekilasinfo"),
        aktif: yes(row, "aktif"),
        createdAt: tanggal(row, "tgl_posting") ?? new Date(),
      },
    });
  }

  for (const row of t("mod_alamat")) {
    await prisma.modAlamat.create({ data: { id: num(row, "id_alamat"), alamat: str(row, "alamat") } });
  }

  for (const row of t("mod_ym")) {
    await prisma.modYm.create({ data: { id: num(row, "id"), nama: str(row, "nama"), username: str(row, "username") } });
  }

  for (const tabel of [
    "kategori", "berita", "tag", "komentar", "katajelek", "halamanstatis", "agenda", "album", "gallery",
    "playlist", "video", "tagvid", "komentarvid", "poling", "hubungi", "download", "member", "menu",
    "templates", "logo", "background", "header", "banner", "iklanatas", "iklantengah", "pasangiklan",
    "sekilasinfo", "mod_alamat", "mod_ym",
  ]) {
    await setelSequence(tabel);
  }

  log("Selesai.");

  if (dilewati.length) {
    log(`\nDilewati (${dilewati.length}):`);
    dilewati.forEach((item) => log(`- ${item}`));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
