# Catatan Setup Environment

## Stack Aktif

- PHP `8.2.12`
- Composer `2.9.7`
- Node.js `22.17.1`
- npm `10.9.2`
- Laravel `12.58.0`
- Breeze `React + TypeScript`

## Lokasi Project

Project utama saat ini:

```text
C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda
```

## Database Aktif

Database yang sekarang dipakai aplikasi:

```text
ekasda
```

## Konfigurasi `.env` Aktif

- `APP_NAME=E-KASDA`
- `APP_LOCALE=id`
- `DB_CONNECTION=mysql`
- `DB_DATABASE=ekasda`
- `DB_USERNAME=root`
- `DB_PASSWORD=` kosong
- `SESSION_DRIVER=file`
- `CACHE_STORE=file`
- `QUEUE_CONNECTION=sync`

## Kenapa Driver Internal Laravel Diubah

Session, cache, dan queue sementara tidak memakai database agar proses sinkronisasi schema bisnis lebih aman dan tidak bentrok dengan kebutuhan tabel internal Laravel.

Strategi aktif saat ini:
- session: file
- cache: file
- queue: sync

## Migration Yang Sudah Dijalankan

Migration sinkronisasi tahap 1 sudah dijalankan ke database `ekasda`, termasuk:

- sinkronisasi tabel `users`
- sinkronisasi tabel bisnis lama
- pembuatan tabel `pembayaran_iuran`
- pembuatan tabel internal Laravel dasar seperti `password_reset_tokens`, `cache`, dan `jobs`

## Menjalankan Project

### Backend

```powershell
cd "C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda"
php artisan serve
```

### Frontend Dev

```powershell
cd "C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda"
npm run dev
```

### Build Frontend

```powershell
cd "C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda"
npm run build
```

## Route Dasar yang Sudah Aktif

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/data-warga`
- `/iuran-wajib`
- `/tagihan-warga`
- `/pembayaran-iuran`
- `/transaksi-kas`
- `/laporan-keuangan`

## Catatan Penting

- halaman dashboard dan modul bisnis sekarang dilindungi middleware `auth`
- login memakai satu input untuk `email` atau `username`
- register sekarang mewajibkan `username`, `email`, `role`, dan `password`
- backend berikutnya tinggal melanjutkan CRUD modul bisnis di atas schema yang sudah disinkronkan
