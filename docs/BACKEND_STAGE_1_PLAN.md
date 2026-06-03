# Backend Tahap 1: Sinkronisasi Database dan Laravel

## Status Tahap 1

Tahap 1 sudah selesai diimplementasikan pada project aktif.

Hasil yang sudah masuk:

- `.env` sudah diarahkan ke database `ekasda`
- driver transisi Laravel sudah diubah ke `file` / `sync` untuk menghindari bentrok awal
- auth sudah disesuaikan agar login bisa memakai `email` atau `username`
- model `User` sudah disesuaikan ke schema `ekasda`
- route dashboard dan modul bisnis sekarang berada di middleware `auth`
- migration sinkronisasi tahap 1 sudah dijalankan
- tabel `pembayaran_iuran` sudah berhasil dibuat

## Tujuan Tahap 1

Tahap 1 difokuskan untuk menyamakan kebutuhan aplikasi web E-KASDA dengan database `ekasda` yang sudah ada. Target akhir tahap ini adalah:

- schema database final disepakati
- arah implementasi auth disepakati
- konflik antara tabel lama dan migration default Laravel dipetakan
- strategi migrasi aman dijalankan sebelum coding backend modul dimulai

## Keputusan Final yang Sudah Disepakati

- database utama yang dipakai: `ekasda`
- login harus bisa memakai `email` atau `username`
- `email` wajib diisi
- tabel `pembayaran_iuran` dibuat
- sistem pembayaran tidak mendukung cicilan
- `tagihan_warga` tetap menjadi tabel kewajiban/tagihan
- tabel inti memakai `created_at` dan `updated_at`

## Implementasi yang Sudah Dilakukan

### Auth dan User Model

Bagian yang sudah disesuaikan:

- `app/Models/User.php`
- `app/Http/Requests/Auth/LoginRequest.php`
- `app/Http/Controllers/Auth/RegisteredUserController.php`
- `app/Http/Requests/ProfileUpdateRequest.php`
- `app/Http/Controllers/ProfileController.php`
- `resources/js/Pages/Auth/Login.tsx`
- `resources/js/Pages/Auth/Register.tsx`
- `resources/js/types/index.d.ts`

Perubahan intinya:

- login memakai field `login`
- backend mendeteksi apakah input adalah email atau username
- register menyimpan ke kolom `nama_lengkap`, `username`, `email`, `role`, `password`
- model `User` memakai primary key `id_user`
- `auth.user.name` tetap tersedia lewat accessor agar frontend lama tidak patah

### Routing dan Keamanan Dasar

- halaman bisnis dipindah ke middleware `auth`
- root `/` tetap publik
- profile tetap aktif dan sudah disesuaikan dengan struktur user baru

### Database dan Migration

Migration yang sudah berjalan:

- `0001_01_01_000000_create_users_table`
- `0001_01_01_000001_create_cache_table`
- `0001_01_01_000002_create_jobs_table`
- `2026_05_21_000100_sync_ekasda_business_tables`
- `2026_05_21_000110_create_pembayaran_iuran_table`

## Kondisi Database Setelah Sinkronisasi

Database `ekasda` sekarang sudah memiliki struktur yang lebih cocok untuk web, termasuk:

- `users` sudah punya `email`, `remember_token`, `email_verified_at`, `created_at`, `updated_at`
- tabel bisnis lama sudah mendapat timestamps dan kolom tambahan yang dibutuhkan
- tabel `pembayaran_iuran` sudah tersedia sebagai pemisah kewajiban dan pembayaran aktual

## Alasan Driver Session/Cache/Queue Tidak Dipakai via Database

Awalnya `.env` memakai:

- `SESSION_DRIVER=database`
- `CACHE_STORE=database`
- `QUEUE_CONNECTION=database`

Pada fase sinkronisasi awal, pola itu berisiko memperbesar permukaan bentrok schema. Karena itu strategi aktif sekarang adalah:

- `SESSION_DRIVER=file`
- `CACHE_STORE=file`
- `QUEUE_CONNECTION=sync`

Nanti setelah backend bisnis stabil, pengaturan ini masih bisa dievaluasi ulang.

## Output Tahap 1

Tahap 1 sekarang dianggap selesai karena:

- schema final database tertulis jelas
- konflik Laravel vs schema lama sudah dipetakan
- auth final sudah diimplementasikan
- `.env`, migration, dan model inti sudah disesuaikan
- migration sinkronisasi sudah berhasil dijalankan

## Langkah Setelah Tahap 1

Urutan yang disarankan sesudah ini:

1. implementasi backend modul `Warga`
2. implementasi backend modul `Iuran Wajib`
3. implementasi backend modul `Tagihan Warga`
4. implementasi backend modul `Pembayaran Iuran`
5. implementasi backend modul `Transaksi Kas`
6. implementasi backend modul `Laporan`
7. ganti data dummy frontend dengan data nyata dari controller Laravel
