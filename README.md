# CMS Portal Berita

Portal berita dengan panel redaksi. Pembaca membuka berita per kategori, mencari artikel, berkomentar, ikut jajak pendapat, melihat agenda, galeri foto, dan video, lalu mengirim pesan ke redaksi.
Redaksi menulis dan menerbitkan berita dari panel, mengatur menu, iklan, dan tampilan situs, serta membagi hak akses per modul.

Ini adalah rewrite CMS Lokomedia (PHP dan MySQL, data contoh SwaraKalibata) ke Next.js 16, PostgreSQL, Prisma 7, Better Auth, dan shadcn/ui.
Ke-34 tabel versi lama punya padanan di skema baru, dan isinya bisa dipindahkan dengan `pnpm db:import`.

## Isi aplikasi

Portal publik, tanpa login:

- Beranda dengan headline, berita terbaru, pilihan redaksi, terpopuler, jajak pendapat, agenda, dan iklan
- Halaman berita dengan foto, video YouTube, tag, berita terkait, dan komentar
- Indeks berita, halaman kategori, halaman tag, dan pencarian
- Halaman statis, agenda, galeri foto, video beserta komentarnya, download, hasil jajak pendapat, dan form Hubungi Kami
- RSS di `/rss.xml`, tema terang dan gelap, dan pencatatan kunjungan per IP per hari

Panel redaksi di `/dashboard`:

- Dashboard: draf yang belum terbit, pesan belum dibaca, komentar minggu ini, grafik kunjungan 14 hari, dan berita paling banyak dibaca. Angkanya dihitung naik saat halaman dibuka.
- Berita dengan editor teks, foto, tag, headline, pilihan redaksi, dan jadwal terbit
- Kategori, tag, moderasi komentar, sensor kata, halaman statis, agenda, sekilas info
- Album dan galeri foto, playlist, video (unggah MP4 atau tautan YouTube), tag video, komentar video, download
- Jajak pendapat, pesan masuk, member
- Iklan utama, iklan layanan, iklan depan, iklan kiri, header, logo, background
- Identitas website, menu dan submenu, template warna (merah, biru, hijau), alamat kontak
- Manajemen user dan modul, pengaturan profil, ganti password, dan tema tampilan

## Hak akses

Ada dua level, sama seperti versi lama. Level admin membuka semua modul.
Level user hanya membuka modul yang dicentang admin di Manajemen User, dan di modul Berita hanya melihat serta mengubah tulisannya sendiri.
Di Manajemen Modul, admin bisa mengganti nama dan urutan modul di sidebar, menonaktifkannya, atau menjadikannya khusus admin.

## Menjalankan di komputer sendiri

Yang dibutuhkan: Node.js 22 atau lebih baru, pnpm, dan PostgreSQL.

```bash
pnpm install
cp .env.example .env
```

Isi `.env`:

| Variabel | Isi |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL, misalnya `postgresql://postgres:postgres@localhost:5432/cms_portal_berita` |
| `DATABASE_POOL_MAX` | Kosongkan untuk PostgreSQL biasa. Isi `1` bila memakai `prisma dev` (lihat di bawah) |
| `BETTER_AUTH_SECRET` | String acak minimal 32 karakter, misalnya hasil `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Alamat aplikasi, misalnya `http://localhost:3000`. Dipakai juga untuk tautan di RSS |
| `NEXT_PUBLIC_APP_NAME` | Nama situs sebelum Identitas Website diisi |
| `NEXT_PUBLIC_APP_TIMEZONE` | Zona waktu tanggal terbit dan statistik, bawaannya `Asia/Jakarta` |

Buat tabel, isi data awal, lalu jalankan:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Aplikasi berjalan di http://localhost:3000.

Kalau PostgreSQL belum terpasang, untuk development bisa memakai Postgres lokal bawaan Prisma.
Jalankan `pnpm exec prisma dev -n cms-portal-berita -d`, salin URL yang ditampilkan ke `DATABASE_URL`,
dan isi `DATABASE_POOL_MAX` dengan `1`. Server ini tidak tahan banyak koneksi bersamaan, jadi jangan dipakai untuk produksi.

## Memindahkan data dari versi lama

Arahkan perintah impor ke folder CMS lama. Folder itu harus berisi file `.sql` hasil ekspor phpMyAdmin dan folder foto bawaan Lokomedia (`foto_berita`, `img_galeri`, `foto_user`, dan seterusnya).

```bash
pnpm db:import "E:\Z\Project\CMS Portal Berita"
```

Perintah ini mengosongkan data CMS yang ada, mengisi ulang semua tabel dari dump, dan menyalin foto ke folder `storage/`.
Akun dicocokkan berdasarkan username. Password lama yang masih berupa hash MD5 tetap bisa dipakai login, lalu diganti hash baru begitu pemiliknya mengubah password.
Link menu lama seperti `kategori-48-hukum.html` diubah menjadi `/kategori/hukum`.

Baris yang filenya tidak ada di folder lama dilewati dan dicantumkan di akhir output.
Pada data SwaraKalibata, yang dilewati adalah 5 file download, 3 gambar header, dan 3 gambar banner.

## Akun awal

Seeder membuat akun admin dengan username `admin` dan password `admin`. Ganti password itu setelah login pertama.
Bila memakai data hasil impor, akun dan password mengikuti tabel `users` versi lama.

Akun redaksi baru dibuat admin di menu Manajemen User. Tidak ada pendaftaran mandiri. Akun yang diblokir langsung keluar dari semua perangkat.

## File unggahan

Foto, video, dan file download disimpan di folder `storage/` (tidak ikut git) dan disajikan oleh route `/media/[folder]/[file]`.
Ukuran maksimal: gambar 2 MB, video 50 MB, file download 20 MB.
Folder ini perlu ikut dicadangkan bersama database.

## Batasan saat ini

- Belum ada `DESIGN.md`. Tampilan dibuat sebagai draf tanpa arahan desain: tata letak koran yang tenang, font Source Serif dan Source Sans, dan warna utama dari Template Warna. Animasi hanya pada angka dashboard.
- Belum ada pengiriman email. Tautan reset password ditulis ke log server dalam format `[reset-password] email: url`.
- Yahoo! Messenger sudah ditutup, jadi data Kontak YM hanya tampil sebagai teks di halaman Hubungi Kami.
- Tabel member dibawa apa adanya dan bisa dikelola di panel, tetapi portal belum punya login member. Di data lama tabel ini kosong.
- Komentar pembaca langsung tampil tanpa persetujuan, seperti versi lama. Pengaman spam berupa kolom jebakan dan batas kiriman per IP, bukan captcha gambar.
- Halaman yang tidak ditemukan menampilkan halaman 404 dengan tanda `noindex`, tetapi kode status HTTP-nya 200 karena halaman sudah mulai dikirim bertahap.
- Belum ada test otomatis. Alur utama diuji manual di browser: halaman publik, komentar, jajak pendapat, login, CRUD panel, hak akses level user, template warna, tema terang dan gelap, dan tampilan ponsel.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `pnpm dev` | Server development |
| `pnpm build` | Build produksi |
| `pnpm start` | Menjalankan hasil build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Generate tipe route lalu cek TypeScript |
| `pnpm db:migrate` | Membuat dan menjalankan migrasi |
| `pnpm db:deploy` | Menjalankan migrasi di produksi |
| `pnpm db:seed` | Akun admin, identitas, daftar modul, dan template warna |
| `pnpm db:import "<folder>"` | Memindahkan data dari CMS Lokomedia |
| `pnpm db:reset` | Mengosongkan database lalu migrasi dan seed ulang |
| `pnpm db:studio` | Prisma Studio |
