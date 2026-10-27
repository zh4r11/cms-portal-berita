-- CreateEnum
CREATE TYPE "Level" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "StatusPoling" AS ENUM ('pertanyaan', 'jawaban');

-- CreateEnum
CREATE TYPE "StatusModul" AS ENUM ('admin', 'user');

-- CreateTable
CREATE TABLE "kategori" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "author_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berita" (
    "id" SERIAL NOT NULL,
    "kategori_id" INTEGER,
    "author_id" TEXT,
    "judul" VARCHAR(200) NOT NULL,
    "sub_judul" VARCHAR(200),
    "slug" VARCHAR(220) NOT NULL,
    "youtube" VARCHAR(20),
    "headline" BOOLEAN NOT NULL DEFAULT false,
    "aktif" BOOLEAN NOT NULL DEFAULT false,
    "utama" BOOLEAN NOT NULL DEFAULT false,
    "isi" TEXT NOT NULL,
    "gambar" TEXT,
    "keterangan_gambar" TEXT,
    "dibaca" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komentar" (
    "id" SERIAL NOT NULL,
    "berita_id" INTEGER NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "url" VARCHAR(200),
    "isi" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "komentar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "katajelek" (
    "id" SERIAL NOT NULL,
    "kata" VARCHAR(60) NOT NULL,
    "ganti" VARCHAR(60) NOT NULL,

    CONSTRAINT "katajelek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "halamanstatis" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(170) NOT NULL,
    "isi" TEXT NOT NULL,
    "gambar" TEXT,
    "dibaca" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "halamanstatis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda" (
    "id" SERIAL NOT NULL,
    "tema" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(170) NOT NULL,
    "isi" TEXT NOT NULL,
    "tempat" VARCHAR(150) NOT NULL,
    "pengirim" VARCHAR(100) NOT NULL,
    "gambar" TEXT,
    "tgl_mulai" DATE NOT NULL,
    "tgl_selesai" DATE NOT NULL,
    "jam" VARCHAR(50) NOT NULL,
    "dibaca" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "album" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(170) NOT NULL,
    "keterangan" TEXT,
    "gambar" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "dilihat" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery" (
    "id" SERIAL NOT NULL,
    "album_id" INTEGER NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "keterangan" TEXT,
    "gambar" TEXT NOT NULL,
    "author_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "gambar" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "author_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video" (
    "id" SERIAL NOT NULL,
    "playlist_id" INTEGER,
    "judul" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(170) NOT NULL,
    "keterangan" TEXT,
    "gambar" TEXT,
    "file" TEXT,
    "youtube" VARCHAR(20),
    "dilihat" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagvid" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tagvid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komentarvid" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "url" VARCHAR(200),
    "isi" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "komentarvid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poling" (
    "id" SERIAL NOT NULL,
    "pilihan" VARCHAR(200) NOT NULL,
    "status" "StatusPoling" NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "poling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hubungi" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "subjek" VARCHAR(150) NOT NULL,
    "pesan" TEXT NOT NULL,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hubungi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "download" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "nama_file" TEXT NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "download_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistik" (
    "id" SERIAL NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "tanggal" DATE NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 1,
    "online" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identitas" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nama_website" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "url" VARCHAR(200),
    "facebook" VARCHAR(200),
    "rekening" VARCHAR(200),
    "no_telp" VARCHAR(30),
    "meta_deskripsi" VARCHAR(250),
    "meta_keyword" VARCHAR(250),
    "favicon" TEXT,

    CONSTRAINT "identitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "nama" VARCHAR(50) NOT NULL,
    "link" VARCHAR(200),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(100) NOT NULL,
    "pembuat" VARCHAR(100),
    "folder" VARCHAR(30) NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logo" (
    "id" SERIAL NOT NULL,
    "gambar" TEXT NOT NULL,

    CONSTRAINT "logo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background" (
    "id" SERIAL NOT NULL,
    "gambar" TEXT NOT NULL,

    CONSTRAINT "background_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "url" VARCHAR(200),
    "gambar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "header_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "url" VARCHAR(200),
    "gambar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iklanatas" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "url" VARCHAR(200),
    "gambar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "iklanatas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iklantengah" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "url" VARCHAR(200),
    "gambar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "iklantengah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasangiklan" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "url" VARCHAR(200),
    "gambar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pasangiklan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sekilasinfo" (
    "id" SERIAL NOT NULL,
    "info" VARCHAR(200) NOT NULL,
    "gambar" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sekilasinfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mod_alamat" (
    "id" SERIAL NOT NULL,
    "alamat" TEXT NOT NULL,

    CONSTRAINT "mod_alamat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mod_ym" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) NOT NULL,

    CONSTRAINT "mod_ym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modul" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(50) NOT NULL,
    "link" VARCHAR(50) NOT NULL,
    "status" "StatusModul" NOT NULL DEFAULT 'user',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_modul" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "modul_id" INTEGER NOT NULL,

    CONSTRAINT "users_modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "display_username" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "no_telp" VARCHAR(30),
    "level" "Level" NOT NULL DEFAULT 'user',
    "blokir" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BeritaToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BeritaToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TagVideoToVideo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TagVideoToVideo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "kategori_slug_key" ON "kategori"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "berita_slug_key" ON "berita"("slug");

-- CreateIndex
CREATE INDEX "berita_aktif_published_at_idx" ON "berita"("aktif", "published_at");

-- CreateIndex
CREATE INDEX "berita_kategori_id_idx" ON "berita"("kategori_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_slug_key" ON "tag"("slug");

-- CreateIndex
CREATE INDEX "komentar_berita_id_idx" ON "komentar"("berita_id");

-- CreateIndex
CREATE UNIQUE INDEX "katajelek_kata_key" ON "katajelek"("kata");

-- CreateIndex
CREATE UNIQUE INDEX "halamanstatis_slug_key" ON "halamanstatis"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "agenda_slug_key" ON "agenda"("slug");

-- CreateIndex
CREATE INDEX "agenda_tgl_mulai_idx" ON "agenda"("tgl_mulai");

-- CreateIndex
CREATE UNIQUE INDEX "album_slug_key" ON "album"("slug");

-- CreateIndex
CREATE INDEX "gallery_album_id_idx" ON "gallery"("album_id");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_slug_key" ON "playlist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "video_slug_key" ON "video"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tagvid_slug_key" ON "tagvid"("slug");

-- CreateIndex
CREATE INDEX "komentarvid_video_id_idx" ON "komentarvid"("video_id");

-- CreateIndex
CREATE INDEX "statistik_tanggal_idx" ON "statistik"("tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "statistik_ip_tanggal_key" ON "statistik"("ip", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "member_email_key" ON "member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "member_username_key" ON "member"("username");

-- CreateIndex
CREATE UNIQUE INDEX "modul_link_key" ON "modul"("link");

-- CreateIndex
CREATE UNIQUE INDEX "users_modul_user_id_modul_id_key" ON "users_modul"("user_id", "modul_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "_BeritaToTag_B_index" ON "_BeritaToTag"("B");

-- CreateIndex
CREATE INDEX "_TagVideoToVideo_B_index" ON "_TagVideoToVideo"("B");

-- AddForeignKey
ALTER TABLE "kategori" ADD CONSTRAINT "kategori_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berita" ADD CONSTRAINT "berita_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berita" ADD CONSTRAINT "berita_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komentar" ADD CONSTRAINT "komentar_berita_id_fkey" FOREIGN KEY ("berita_id") REFERENCES "berita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "halamanstatis" ADD CONSTRAINT "halamanstatis_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album" ADD CONSTRAINT "album_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video" ADD CONSTRAINT "video_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video" ADD CONSTRAINT "video_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komentarvid" ADD CONSTRAINT "komentarvid_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_modul" ADD CONSTRAINT "users_modul_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_modul" ADD CONSTRAINT "users_modul_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BeritaToTag" ADD CONSTRAINT "_BeritaToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "berita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BeritaToTag" ADD CONSTRAINT "_BeritaToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagVideoToVideo" ADD CONSTRAINT "_TagVideoToVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "tagvid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagVideoToVideo" ADD CONSTRAINT "_TagVideoToVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
