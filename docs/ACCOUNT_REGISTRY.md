# Registry Akun E-KASDA

Dokumen ini dipakai untuk mencatat akun yang sudah dibuat selama pengembangan dan testing agar tidak mudah lupa.

## Waktu Pengecekan

- Tanggal cek: `2026-05-23`
- Waktu cek: `17:40:03`
- Sumber data: tabel `users` pada database `ekasda`

## Daftar Akun Saat Ini

### 1. Akun `coba_admin`

- `id_user`: `1`
- `username`: `coba_admin`
- `email`: `zanken41@gmail.com`
- `nama_lengkap`: `coba_Admin`
- `role`: `Ketua_RT`
- `email_verified_at`: `NULL`
- `is_approved`: `0`
- `approved_at`: `NULL`
- `approved_by`: `NULL`
- `created_at`: `2026-05-22 08:54:55`

Status:

- belum verifikasi email
- belum disetujui

Catatan:

- ini akun lama/testing

### 2. Akun `wiwaw`

- `id_user`: `2`
- `username`: `wiwaw`
- `email`: `cahyo4797@gmail.com`
- `nama_lengkap`: `wiwaw`
- `role`: `Ketua_RT`
- `email_verified_at`: `2026-05-23 11:39:41`
- `is_approved`: `1`
- `approved_at`: `2026-05-23 14:48:33`
- `approved_by`: `NULL`
- `created_at`: `2026-05-23 11:19:16`

Status:

- email sudah terverifikasi
- akun sudah disetujui
- bisa dipakai sebagai akun utama `Ketua_RT`

Catatan:

- ini akun yang paling siap dipakai untuk approval akun dan testing fitur penuh

### 3. Akun `qa_user_1779523281`

- `id_user`: `3`
- `username`: `qa_user_1779523281`
- `email`: `qa_user_1779523281@example.com`
- `nama_lengkap`: `QA User`
- `role`: `Bendahara`
- `email_verified_at`: `2026-05-23 15:03:18`
- `is_approved`: `1`
- `approved_at`: `2026-05-23 15:03:41`
- `approved_by`: `NULL`
- `created_at`: `2026-05-23 15:01:25`

Status:

- email sudah terverifikasi
- akun sudah disetujui

Catatan:

- ini akun test otomatis yang dibuat saat pengujian backend
- aman untuk dihapus nanti jika tidak dipakai

### 4. Akun `zann`

- `id_user`: `4`
- `username`: `zann`
- `email`: `kuliahdwinurcahyo@gmail.com`
- `nama_lengkap`: `zanken`
- `role`: `Bendahara`
- `email_verified_at`: `2026-05-23 16:32:03`
- `is_approved`: `0`
- `approved_at`: `NULL`
- `approved_by`: `NULL`
- `created_at`: `2026-05-23 16:26:49`

Status:

- email sudah terverifikasi
- masih menunggu persetujuan

Catatan:

- ini akun yang cocok untuk menguji flow pending approval

## Ringkasan Cepat

### Akun aktif penuh

- `wiwaw` -> `Ketua_RT`
- `qa_user_1779523281` -> `Bendahara`

### Akun belum verified

- `coba_admin`

### Akun verified tapi belum approved

- `zann`

## Rekomendasi Operasional

- pakai `wiwaw` sebagai akun utama `Ketua_RT`
- pakai `zann` untuk uji approval akun
- hapus `qa_user_1779523281` jika akun test tidak lagi dibutuhkan
- putuskan apakah `coba_admin` mau diselesaikan verifikasinya atau dihapus

## Catatan Keamanan

- dokumen ini tidak menyimpan password
- password akun tetap harus diingat atau direset lewat flow aplikasi
- jangan tambahkan hash password ke dokumen ini

## Kapan Dokumen Ini Diperbarui

Perbarui dokumen ini setiap kali:

- membuat akun test baru
- menyetujui akun baru
- menghapus akun test
- mengganti akun utama pengujian
