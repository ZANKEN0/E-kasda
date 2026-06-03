# Panduan Public Testing Dengan Cloudflare Tunnel

Dokumen ini dipakai untuk membuka akses publik sementara ke aplikasi `E-KASDA` dari laptop lokal agar teman atau tim lain bisa melihat dan melakukan `try and error`.

## Tujuan

Cloudflare Tunnel pada panduan ini dipakai untuk:

- membagikan aplikasi lokal ke internet sementara
- menguji login, verifikasi email, approval akun, dan fitur bisnis dari perangkat lain
- melakukan demo tanpa deploy penuh ke hosting

Cloudflare Tunnel pada mode ini **bukan deploy permanen**. Aplikasi tetap berjalan di laptop lokal Anda.

## Cara Kerja Singkat

Alurnya seperti ini:

1. Laravel berjalan di laptop lokal pada `http://127.0.0.1:8000`
2. frontend sudah di-build ke `public/build`
3. `cloudflared` membuat URL publik sementara
4. teman membuka URL publik tersebut
5. semua request tetap diproses oleh aplikasi di laptop lokal Anda

## Kapan Dipakai

Pakai tunnel ini saat:

- ingin berbagi akses cepat ke teman
- ingin tes dari HP, tablet, atau laptop lain
- ingin validasi flow register, verify email, approval, dashboard, dan laporan

Jangan jadikan tunnel ini solusi final untuk produksi.

## Prasyarat

Sebelum membuka tunnel, pastikan:

- `cloudflared` sudah terpasang dan bisa dijalankan
- MySQL lokal aktif
- database `ekasda` siap dipakai
- koneksi internet stabil
- laptop tidak tidur atau mati saat link sedang dipakai

## Cek Instalasi Cloudflared

Di terminal:

```powershell
cloudflared --version
```

Kalau belum terbaca, Anda masih bisa menjalankan file langsung dari lokasi install.

Contoh:

```powershell
C:\Cloudflared\bin\cloudflared.exe --version
```

## Langkah Menjalankan Public Testing

### 1. Masuk ke folder project

```powershell
cd "C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda"
```

### 2. Build frontend

```powershell
npm run build
```

Hasil build akan masuk ke folder:

- [public/build](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\public\build)

Mode ini lebih cocok untuk dibagikan ke publik daripada `npm run dev`.

### 3. Jalankan Laravel

```powershell
php artisan serve
```

Biasanya aplikasi akan aktif di:

- `http://127.0.0.1:8000`

### 4. Buka Cloudflare Tunnel

Di terminal baru, jalankan:

```powershell
cloudflared tunnel --url http://127.0.0.1:8000
```

Kalau `PATH` belum terbaca, Anda bisa pakai full path:

```powershell
C:\Cloudflared\bin\cloudflared.exe tunnel --url http://127.0.0.1:8000
```

### 5. Salin URL publik

Cloudflare akan menampilkan URL seperti:

```text
https://nama-acak.trycloudflare.com
```

Inilah link yang bisa dibagikan ke teman.

## Wajib Ubah APP_URL

Karena aplikasi memakai:

- login
- verifikasi email
- approval akun

maka `APP_URL` harus disamakan dengan URL publik tunnel.

Buka file:

- [\.env](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\.env)

Ubah:

```env
APP_URL=https://nama-acak.trycloudflare.com
```

Lalu bersihkan cache config:

```powershell
php artisan optimize:clear
```

Kalau `APP_URL` masih `localhost`, link verifikasi email akan salah arah.

## Checklist .env Sebelum Link Dibagikan

Sebelum link tunnel dibagikan, cek file:

- [\.env](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\.env)

Nilai minimum yang disarankan:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://nama-acak.trycloudflare.com
```

Kalau masih seperti ini:

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost
```

maka aplikasi belum siap dibagikan untuk public testing.

Setelah mengubah `.env`, jalankan:

```powershell
php artisan optimize:clear
```

Lalu restart:

```powershell
php artisan serve
cloudflared tunnel --url http://127.0.0.1:8000
```

## Kondisi Project Saat Dicek

Saat pengecekan terakhir, project ini masih berada pada kondisi:

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost
```

Artinya, konfigurasi tersebut perlu diubah dulu sebelum link tunnel dibagikan ke teman.

## Rekomendasi Setting Saat Dibagikan

Saat aplikasi dibuka ke publik untuk testing, lebih aman gunakan:

```env
APP_ENV=production
APP_DEBUG=false
```

Setelah itu jalankan lagi:

```powershell
php artisan optimize:clear
```

Catatan:

- jika sedang debugging berat, Anda bisa sementara tetap memakai `APP_DEBUG=true`
- tetapi jangan bagikan link publik terlalu lama saat debug aktif

## Urutan Terminal Yang Disarankan

### Terminal 1

```powershell
cd "C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda"
php artisan serve
```

### Terminal 2

```powershell
cd "C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda"
cloudflared tunnel --url http://127.0.0.1:8000
```

### Terminal tambahan jika ada perubahan frontend besar

```powershell
cd "C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda"
npm run build
```

## Workflow Harian Yang Disarankan

### Mode develop lokal

Dipakai saat Anda sedang ngoding:

```powershell
php artisan serve
npm run dev
```

### Mode public testing sementara

Dipakai saat ingin dibuka ke teman:

```powershell
npm run build
php artisan serve
cloudflared tunnel --url http://127.0.0.1:8000
```

## Kelebihan dan Kekurangan

### Kelebihan

- cepat
- tidak perlu hosting dulu
- cocok untuk demo
- cocok untuk uji multi-device

### Kekurangan

- link berubah setiap kali quick tunnel dijalankan ulang
- aplikasi hanya hidup saat laptop Anda menyala
- performa bergantung pada laptop dan internet lokal
- bukan solusi jangka panjang

## Checklist Sebelum Link Dibagikan

- `npm run build` sudah selesai
- `php artisan serve` aktif
- `cloudflared tunnel --url http://127.0.0.1:8000` aktif
- `APP_URL` sudah diubah ke URL `trycloudflare`
- `php artisan optimize:clear` sudah dijalankan
- login normal
- register normal
- email verifikasi mengarah ke domain publik yang benar
- akun `Ketua_RT` bisa masuk ke halaman `Persetujuan Akun`

## Checklist Setelah Testing Selesai

- hentikan tunnel
- kembalikan `APP_URL` ke kebutuhan lokal jika perlu
- bila perlu, kembalikan:

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost
```

- jalankan lagi:

```powershell
php artisan optimize:clear
```

## Masalah Yang Paling Sering Terjadi

### Link verifikasi email mengarah ke localhost

Penyebab:

- `APP_URL` belum diubah

Solusi:

- ubah `APP_URL` ke URL `trycloudflare`
- jalankan `php artisan optimize:clear`

### Tampilan frontend tidak ikut update

Penyebab:

- source frontend berubah, tetapi belum dibuild ulang

Solusi:

```powershell
npm run build
```

### Teman tidak bisa membuka link

Penyebab yang mungkin:

- terminal tunnel sudah tertutup
- laptop tidur
- internet terputus
- Laravel server mati

### Aplikasi lambat saat diakses publik

Penyebab:

- semua request tetap masuk ke laptop lokal
- koneksi upload internet lokal terbatas

## Kapan Sebaiknya Naik ke Hosting

Sudah waktunya deploy sungguhan jika:

- testing sudah rutin
- link stabil dibutuhkan
- banyak user mengakses bersamaan
- tidak ingin laptop harus selalu menyala
- ingin domain tetap dan lingkungan yang lebih aman

## Catatan Penting Keamanan

- jangan commit file `.env`
- jangan bagikan kredensial database
- kalau App Password email pernah terpapar, segera ganti atau regenerate
- jangan terlalu lama membagikan app dengan `APP_DEBUG=true`
- gunakan tunnel ini untuk testing, bukan sebagai production final
