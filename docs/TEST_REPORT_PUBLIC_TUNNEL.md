# Laporan Test Public Tunnel E-KASDA

Dokumen ini mencatat hasil pengujian saat aplikasi `E-KASDA` dibuka ke publik menggunakan `Cloudflare Tunnel`.

## Informasi Umum

- Tanggal test: `2026-05-23`
- Mode test: `public testing` melalui `Cloudflare Tunnel`
- URL publik saat test:
  - `https://lace-inventory-washer-commissioner.trycloudflare.com`
- Aplikasi lokal:
  - `http://127.0.0.1:8000`

## Tujuan Test

Tujuan pengujian ini adalah memastikan:

- aplikasi bisa dibuka dari internet melalui tunnel
- asset frontend hasil build bisa dimuat dengan benar
- konfigurasi `.env` sudah cocok untuk akses publik
- alur login, verifikasi email, dan halaman utama tidak rusak saat dibuka lewat URL publik

## Kondisi Awal

Sebelum perbaikan, project sudah berada pada kondisi:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://lace-inventory-washer-commissioner.trycloudflare.com
```

Frontend juga sudah berhasil dibuild ke:

- [public/build](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\public\build)

## Gejala Yang Muncul

Saat URL publik dibuka di browser:

- halaman hanya tampil putih
- tidak ada tampilan landing page atau halaman aplikasi
- tunnel aktif, tetapi aplikasi tidak terlihat

## Proses Pengecekan

### 1. Cek respons lokal Laravel

Dilakukan request ke:

- `http://127.0.0.1:8000`

Hasil:

- status `200`
- HTML utama Laravel tampil normal

Kesimpulan:

- server Laravel lokal aktif
- masalah bukan pada `php artisan serve`

### 2. Cek respons dari URL tunnel

Dilakukan request ke:

- `https://lace-inventory-washer-commissioner.trycloudflare.com`

Hasil:

- status `200`
- HTML utama tetap terkirim

Kesimpulan:

- tunnel aktif
- masalah bukan pada koneksi tunnel

### 3. Cek asset frontend pada HTML

Setelah dicek, asset hasil build masih dirender seperti ini:

```text
http://lace-inventory-washer-commissioner.trycloudflare.com/build/assets/...
```

Padahal halaman dibuka lewat:

```text
https://lace-inventory-washer-commissioner.trycloudflare.com
```

Kesimpulan:

- terjadi `mixed content`
- browser memblokir asset `http` pada halaman `https`
- akibatnya JavaScript frontend tidak termuat
- hasil akhirnya layar putih

## Penyebab Utama

Laravel belum mempercayai header proxy dari Cloudflare Tunnel, sehingga request HTTPS dari proxy tetap dianggap sebagai HTTP oleh aplikasi.

Dampaknya:

- URL asset hasil build keluar sebagai `http://...`
- bukan `https://...`

## Perbaikan Yang Dilakukan

Perbaikan diterapkan di file:

- [bootstrap/app.php](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\bootstrap\app.php)

Perubahan:

```php
$middleware->trustProxies(at: '*');
```

Tujuannya:

- membuat Laravel mempercayai proxy/tunnel
- membaca `X-Forwarded-*` header dengan benar
- mengenali request publik sebagai HTTPS

Setelah itu dilakukan:

```powershell
php artisan optimize:clear
```

## Hasil Setelah Perbaikan

Asset frontend kemudian berubah menjadi:

```text
https://lace-inventory-washer-commissioner.trycloudflare.com/build/assets/...
```

Kesimpulan:

- asset sekarang konsisten memakai `https`
- mixed content hilang
- penyebab utama layar putih sudah diperbaiki

## Status Akhir

- `Laravel lokal`: normal
- `Cloudflare Tunnel`: normal
- `APP_URL`: sudah benar
- `build frontend`: berhasil
- `asset publik`: sudah berubah ke `https`
- `root cause`: ditemukan
- `fix`: sudah diterapkan

Status akhir test:

- `PASS dengan perbaikan`

## Langkah Yang Disarankan Setelah Fix

Setelah perbaikan ini, langkah yang disarankan:

1. lakukan `hard refresh` di browser:

```text
Ctrl + F5
```

2. jika perlu, restart proses:

```powershell
php artisan serve
cloudflared tunnel --url http://127.0.0.1:8000
```

3. cek ulang:
   - landing page
   - register
   - login
   - verifikasi email
   - approval akun

## Checklist Verifikasi Manual

- halaman awal tampil normal dari URL tunnel
- CSS termuat
- JavaScript termuat
- register bisa diakses
- login bisa diakses
- email verification tetap memakai domain publik
- approval akun bisa dibuka oleh `Ketua_RT`

## Catatan Penting

- quick tunnel Cloudflare menghasilkan URL acak yang bisa berubah jika tunnel dijalankan ulang
- jika URL berubah, `APP_URL` perlu diperbarui lagi
- setelah mengubah `APP_URL`, jalankan kembali:

```powershell
php artisan optimize:clear
```

## File Yang Terkait Dalam Test Ini

- [\.env](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\.env)
- [bootstrap/app.php](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\bootstrap\app.php)
- [PUBLIC_TESTING_TUNNEL.md](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\PUBLIC_TESTING_TUNNEL.md)

## Ringkasan Singkat

Masalah layar putih saat public testing bukan disebabkan tunnel mati atau build gagal, melainkan karena asset frontend masih dirender sebagai `http` pada halaman `https`. Setelah Laravel dikonfigurasi untuk mempercayai proxy tunnel, asset berubah menjadi `https` dan penyebab utama masalah berhasil diselesaikan.
