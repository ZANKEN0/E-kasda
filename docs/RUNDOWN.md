# Rundown Pengembangan E-KASDA

Dokumen ini menjelaskan urutan kerja yang akan dilakukan sebelum kita masuk terlalu jauh ke implementasi.

## Tujuan Utama

Membangun aplikasi administrasi kas RT bernama `E-KASDA` berbasis:

- Laravel 12
- Inertia React
- TypeScript
- MySQL

## Fase Kerja

### 1. Stabilkan pondasi project

Target:

- memastikan auth dasar Laravel berjalan
- memastikan build frontend stabil
- memastikan koneksi database development aman

Status:

- selesai

### 2. Audit dan rapikan database lama

Target:

- memeriksa tabel lama di database `ekasda`
- mencocokkan tabel lama dengan kebutuhan final E-KASDA
- menentukan mana schema yang dipakai, diubah, atau dipisahkan

Tabel lama yang sudah terdeteksi:

- `users`
- `warga`
- `iuran_wajib`
- `tagihan_warga`
- `transaksi_kas`
- `kategori`
- `laporan`

Output fase ini:

- peta schema final
- keputusan relasi data
- arah migrasi dari database lama ke project Laravel

### 3. Rancang model data dan migration final

Target:

- membuat migration Laravel yang rapi dan konsisten
- membuat relasi Eloquent untuk entitas inti

Entitas inti yang akan difokuskan:

- users
- warga
- iuran wajib
- tagihan warga
- transaksi kas
- kategori transaksi
- laporan atau query laporan

Output fase ini:

- migration final
- model Laravel
- relasi antar tabel

### 4. Siapkan role dan alur akses

Target:

- membedakan akses `Admin` dan `Bendahara`
- membatasi menu dan aksi sesuai peran

Output fase ini:

- role policy sederhana
- guard/alur middleware
- redirect dashboard yang rapi

### 5. Bangun layout aplikasi E-KASDA

Target:

- mengganti layout Breeze default dengan layout admin E-KASDA
- membuat struktur:
  - sidebar
  - topbar
  - page container
  - auth layout

Output fase ini:

- layout dasar UI
- komponen navigasi reusable

### 6. Bangun halaman pre-login dan auth

Target:

- landing page awal
- login
- register

Output fase ini:

- halaman awal yang natural dan sesuai project
- login/register yang match dengan sistem

### 7. Bangun modul inti satu per satu

Urutan yang disarankan:

1. dashboard
2. data warga
3. iuran wajib
4. tagihan warga
5. pembayaran iuran
6. transaksi kas
7. laporan keuangan

Output fase ini:

- CRUD inti
- filter dan tabel
- form pembayaran dan pencatatan kas

### 8. Integrasi data lama ke alur baru

Target:

- menyelaraskan data lama dengan schema Laravel final
- memutuskan apakah:
  - import data lama langsung
  - migrasi sebagian
  - atau gunakan data lama hanya sebagai referensi

### 9. Testing dan finalisasi

Target:

- cek route utama
- cek auth flow
- cek CRUD inti
- cek laporan
- rapikan build frontend dan backend

## Prioritas Kerja Berikutnya

Kalau kita lanjut dari posisi sekarang, urutan paling masuk akal adalah:

1. audit database lama `ekasda`
2. tentukan schema final Laravel
3. buat migration + model inti
4. ganti layout Breeze menjadi layout E-KASDA
5. mulai bangun modul `Dashboard` dan `Data Warga`

## Prinsip Kerja

- database lama tidak dihapus sembarangan
- setiap perubahan schema harus bisa dijelaskan
- UI mengikuti design system E-KASDA yang sudah kita sepakati
- implementasi dilakukan bertahap, modul demi modul
