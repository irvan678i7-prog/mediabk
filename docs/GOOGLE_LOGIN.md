# Aktivasi login Google

Halaman `/login` dan demo dapat dibuka tanpa akun ChatGPT setelah akses hosting disetel publik. Login Google memerlukan konfigurasi milik pengelola; tombol dinonaktifkan dengan keterangan jelas jika konfigurasi belum ada.

1. Buka Google Cloud Console / Google Auth Platform dan buat atau pilih proyek. Lengkapi branding, audience, dan pengguna uji jika masih Testing.
2. Buat OAuth Client ID dengan jenis **Web application**.
3. Tambahkan **Authorized JavaScript origin** berikut, tanpa path atau garis miring di akhir:
   `https://ruang-main-bk-interaktif.familiarbread.chatgpt.site`
4. Isi runtime environment `GOOGLE_CLIENT_ID` di hosting menggunakan Client ID yang berakhiran `.apps.googleusercontent.com`, lalu terbitkan ulang. Jangan memasukkan Client Secret, kata sandi, atau token akun ke source.
5. Uji masuk, keluar, akun nonaktif, jenjang guru, dan akses langganan. Untuk publik, atur audience dan status penerbitan Google sesuai persyaratan Google.

Alur menggunakan callback JavaScript Google Identity Services; tidak memerlukan OAuth redirect URI atau Client Secret. Jika verifikasi domain Google memerlukan domain yang Anda miliki, sambungkan domain Anda dahulu dan daftarkan origin domain itu juga. Homepage dan halaman kebijakan privasi tersedia di `/login` dan `/privasi`.

## Akun admin lama

Sebelum masuk pertama kali dengan Google, admin lama membuka `/signin-with-chatgpt?return_to=%2Flogin`, lalu memilih **Tautkan akun Google** pada halaman login. Gunakan email yang sama. Penautan admin tidak diberikan berdasarkan email saja: sesi admin lama wajib terverifikasi. Setelah berhasil, gunakan login Google untuk kunjungan selanjutnya.

Akun guru dengan email yang sama dipetakan ke identitas lama. Akun baru memiliki peran user dan masa aktif 0; admin menetapkan profil jenjang serta memverifikasi pembayaran. Login mendukung Gmail dan Google Workspace dengan domain terverifikasi. Akun Google dengan email pihak ketiga tidak didukung untuk menjaga kepastian kepemilikan email.

## Keamanan

Token Google diverifikasi terhadap kunci resmi Google, issuer, audience, waktu kedaluwarsa, usia token, nonce sekali pakai, dan status email. Session token acak disimpan hanya sebagai hash di D1 dan sebagai cookie Secure/HttpOnly/SameSite=Lax di browser. Sesi berakhir setelah tujuh hari atau logout. API tetap memeriksa blokir, peran, dan masa langganan di server.

Integrasi identitas gateway Sites dipertahankan untuk migrasi akun lama. Jangan memindahkan backend ini ke hosting yang mempercayai header identitas dari internet tanpa gateway tepercaya.

Aktivasi nyata belum dapat diverifikasi sebelum GOOGLE_CLIENT_ID dari pengelola tersedia.
