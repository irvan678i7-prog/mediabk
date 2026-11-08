# Ruang Main BK

Platform media BK untuk guru sebagai fasilitator. Delapan media, empat bidang, mode individu/kelompok. Dibuat dengan React/Vinext, Cloudflare Workers, dan Cloudflare D1.

## Yang sudah tersedia
- Katalog, pencarian, filter bidang/mode, favorit lokal perangkat.
- Tebak Emosi (demo), Labirin Keputusan, Detektif Perundungan, Lampu Pertemanan, TTS, Puzzle Jadwal, Tebak Profesi, Dilema Setelah Lulus.
- Timer opsional, layar penuh, nama/skor tim, pembahasan, unduhan refleksi.
- Profil guru, admin, masa aktif server-side, blokir akun.
- Paket bulanan kalender, rekening configurable, konfirmasi transfer (nama + referensi), persetujuan/penolakan admin.
- Pencegahan konfirmasi pending ganda dan persetujuan berulang.

## Login dan hosting saat ini
Versi ini memakai autentikasi ChatGPT yang disediakan Sites. Situs terbit privat untuk pemilik, BUKAN peluncuran publik. Identitas berasal dari gateway tepercaya, bukan header browser yang dipercaya langsung. D1 dan migrasi diprovisikan melalui Sites.

JANGAN mengunggah build ini langsung ke Worker publik yang menerima header identitas tanpa verifikasi. Untuk deploy mandiri di akun Cloudflare sendiri, integrasikan penyedia autentikasi publik yang memverifikasi token/sesi dan ganti adapter app/chatgpt-auth.ts. Domain saja tidak menyediakan autentikasi. Kode sumber tersedia di https://github.com/irvan678i7-prog/mediabk. Mengunggah kode ke GitHub tidak memindahkan database atau mengaktifkan hosting baru.

## Aktivasi admin
1. Buka situs privat dan masuk dengan akun pemilik.
2. Buka Kelola Admin, masukkan ADMIN_SETUP_KEY yang disampaikan terpisah.
3. Admin pertama ditautkan secara atomik di settings; kode tidak dapat mengambil alih admin yang sudah terbentuk.
4. Atur tarif dan rekening milik Anda. Nilai awal kosong; aplikasi tidak menampilkan rekening atau harga rekaan.
5. Hapus secret ADMIN_SETUP_KEY setelah aktivasi dan deploy ulang.

Secret hanya di konfigurasi server, tidak di kode, manifest, atau GitHub. Setelah akun publik tersedia, pengguna baru mendapat role user dan akses premium terkunci sampai transfer disetujui. Waktu menggunakan epoch milidetik; tanggal ditampilkan id-ID. Bulan kalender dihitung UTC dan tanggal akhir bulan dijepit pada hari terakhir bulan berikutnya.

## Perilaku langganan
Server memeriksa masa aktif pada setiap permintaan media. Ketika habis, permintaan media premium baru ditolak, tetapi akun masih dapat membuka perpanjangan. Media yang sudah dimuat ke browser tidak bisa ditarik kembali; sesi yang sedang berjalan tetap dapat diselesaikan. Tidak ada klaim DRM atau pencegahan salin absolut.

Pembayaran saat ini manual; tidak memotong saldo otomatis, tidak mengirim email pengingat, tidak memakai payment gateway. Bukti berupa referensi transaksi, bukan upload gambar. Admin wajib mencocokkan mutasi. Tidak ada data siswa individual yang disimpan. Favorit hanya lokal, langganan di D1. Riwayat admin maksimum 200 transaksi dan daftar pengguna maksimum 500 pada versi awal.

## Pengembangan
Node >=22.13, pnpm. Jalankan `pnpm install`, `npm run dev`. Konfigurasi .openai/hosting.json mengikat D1 sebagai DB. Skema ada di db/schema.ts dan migrasi di drizzle/.

Untuk database lokal, build lalu jalankan perintah migrasi lokal pada README starter atau workflow hosting. Jangan menjalankan tes fixture pada database produksi.

## Pemeriksaan
- `npx tsc --noEmit`
- `node --experimental-strip-types tests/access.mjs`
- `python3 tests/database.py`
- `tests/api.py`: tes integrasi khusus preview lokal; membutuhkan fixture qa-admin dan tabel lokal. Host tertulis eksplisit untuk menghindari tes pada produksi.
- `npm run build`

Isi media premium hanya di app/lib/media.ts (server); katalog publik di app/lib/media-public.ts. Jangan mengimpor konten premium ke Client Component.

## GitHub
Jangan commit .env, .dev.vars, .wrangler, node_modules, dist, atau runtime credentials. Repositori ini menyimpan kode sumber; data akun, transaksi, dan secret tetap berada di konfigurasi/database server. Domain dan Cloudflare pribadi memerlukan konfigurasi terpisah, khususnya pengganti adapter autentikasi yang dijelaskan di atas.

## Pembaruan jenjang dan interaksi
- `/login` merupakan halaman masuk terpisah; `/dashboard` memerlukan identitas terverifikasi. `/demo` menyediakan demo tanpa akses premium.
- Admin membuat profil guru lewat email, nama, sekolah, dan jenjang SMP/SMA/SMK; profil ditautkan saat guru masuk memakai email ChatGPT yang sama. Ini bukan pembuatan akun/password ChatGPT.
- Penempatan jenjang disimpan di tabel teachers. Guru tidak dapat mengganti jenjang melalui parameter URL. Admin dapat mempratinjau semua jenjang. Profil lama perlu ditetapkan jenjangnya agar dapat membuka premium.
- Delapan media mempunyai penyesuaian situasi, contoh profesi, petunjuk belajar atau refleksi menurut jenjang. Materi dasar lintas jenjang tetap digunakan bila relevan.
- Bimo merespons interaksi dengan animasi dan pesan. Efek audio dibuat secara lokal memakai Web Audio. Pembacaan soal memakai suara bahasa Indonesia dari browser/perangkat; ketersediaan suara bergantung perangkat. Audio dapat dimatikan dan pembacaan dihentikan. Preferensi reduced-motion dihormati.
- Halaman login aplikasi tetap berada di balik gerbang privat hosting. Pendaftaran profil guru tidak otomatis memberikan izin mengakses hosting privat; perlu pengaturan akses ketika diluncurkan untuk guru lain.

## Sesi layanan 45 menit
Semua media memakai enam tahap: pembuka 5, pemanasan 5, permainan inti 15, misi penerapan 10, berbagi hasil 5, dan refleksi 5 menit. Alokasi merupakan panduan fasilitasi, bukan durasi video atau penguncian otomatis. Guru dapat menjeda timer atau berpindah tahap sesuai kebutuhan kelas.

Setiap media memiliki pemanasan, tiga misi penerapan (3/4/3 menit), arah pembahasan, dan kegiatan berbagi. Konten ini mengikuti pemeriksaan akses server yang sama dengan permainan. Catatan bersifat sementara di memori halaman, dapat diunduh sebagai TXT, dan tidak dikirim ke database. Permainan inti tetap berada di memori ketika guru berpindah tahap; timer putaran dijeda saat permainan tersembunyi. Timer sesi menggunakan waktu nyata agar tetap benar ketika tab berada di latar belakang. Muat ulang halaman akan menghapus kemajuan sesi.

Pemeriksaan: `node tests/levels.mjs` memeriksa 24 kombinasi media/jenjang, jumlah alokasi 45 menit, enam tahap, tiga misi, keutuhan materi sumber, dan jawaban/jalur permainan.

## Dialog dan interaksi responsif
Semua konfirmasi aplikasi menggunakan dialog bergaya UI dengan fokus awal Batal, dukungan Escape, dan pengembalian fokus. Notifikasi dapat ditutup; status hasil permainan tetap dapat dibaca tanpa bergantung warna saja. Puzzle jadwal mendukung seret/lepas, tombol panah, dan dua ketukan untuk menukar kartu. TTS mendukung pemilihan petunjuk, sorot kata aktif, maju otomatis, tombol panah, dan Backspace. Tata letak kontrol, papan tim, serta dialog disesuaikan untuk layar kecil; reduced-motion tetap didukung.

`node tests/widgets.mjs` memeriksa pemindahan kartu, batas indeks, keutuhan urutan sumber, dan ketiadaan pop-up native browser dalam komponen aplikasi.

Pemeriksaan browser 5 November 2026: dialog batal/setuju dan detail media mendukung Escape serta pengembalian fokus; dua ketukan dan tombol urutan mengubah kartu; TTS maju mengikuti arah petunjuk dan Backspace kembali ke sel sebelumnya. Komponen jadwal dan TTS diperiksa pada frame 360 px tanpa overflow horizontal. Pengujian ini tidak mencakup transaksi pembayaran langsung.

## Status pertemuan lanjutan
Delapan pertemuan 9–16 sudah dirancang dalam percakapan, tetapi belum diimplementasikan sebagai media aplikasi: Detektif Kekuatan Diri; Misi Berani Bicara; Jembatan Salah Paham; Jejak Digital: Pilih Sebelum Kirim; Laboratorium Cara Belajar; Bos Terakhir: Kebiasaan Menunda; Ekspedisi Dunia Kerja; Peta Langkah Masa Depanku. Rencana durasi masing-masing 45 menit, mengikuti alur enam tahap dan penyesuaian SMP/SMA/SMK.
