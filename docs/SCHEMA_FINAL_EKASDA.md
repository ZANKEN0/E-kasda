# Schema Final Database `ekasda`

Dokumen ini menjadi acuan schema final yang akan dipakai untuk backend web E-KASDA.

## Prinsip Utama

- database utama: `ekasda`
- login user: bisa dengan `email` atau `username`
- `email` wajib diisi
- `tagihan_warga` adalah tabel kewajiban
- `pembayaran_iuran` adalah tabel pembayaran aktual
- sistem pembayaran tidak mendukung cicilan
- tabel inti memakai `created_at` dan `updated_at`

## 1. Tabel `users`

Fungsi:
Menyimpan akun pengguna yang dapat masuk ke sistem.

Kolom final yang direkomendasikan:

- `id_user` bigint unsigned primary key auto increment
- `username` varchar unik, wajib
- `email` varchar unik, wajib
- `password` varchar, wajib
- `nama_lengkap` varchar, wajib
- `role` enum atau varchar terbatas, wajib
- `email_verified_at` timestamp nullable
- `remember_token` varchar nullable
- `created_at` timestamp nullable
- `updated_at` timestamp nullable

Aturan:
- `username` tidak boleh duplikat
- `email` tidak boleh duplikat
- login boleh menggunakan `username` atau `email`

## 2. Tabel `warga`

Fungsi:
Menyimpan data warga yang menjadi subjek iuran dan tagihan.

Kolom final minimum:

- `id_warga` bigint unsigned primary key auto increment
- `nama` varchar, wajib
- `no_rumah` varchar, wajib
- `no_telepon` varchar nullable
- `status_hunian` enum `Tetap` / `Kontrak`, wajib
- `created_at` timestamp nullable
- `updated_at` timestamp nullable

Opsional pengembangan:
- `blok`
- `alamat`
- `status_aktif`

## 3. Tabel `iuran_wajib`

Fungsi:
Master jenis iuran yang dapat ditagihkan ke warga.

Kolom final minimum:

- `id_iuran_wajib` bigint unsigned primary key auto increment
- `nama_iuran` varchar, wajib
- `nominal_default` decimal atau bigint, wajib
- `periode` varchar, wajib
- `is_active` boolean default true
- `created_at` timestamp nullable
- `updated_at` timestamp nullable

Catatan:
- `periode` bisa tetap string pada versi awal
- jika nanti perlu validasi lebih ketat, bisa dibatasi ke nilai tertentu seperti bulanan atau tahunan

## 4. Tabel `tagihan_warga`

Fungsi:
Menyimpan kewajiban yang harus dibayar warga pada periode tertentu.

Kolom final yang direkomendasikan:

- `id_tagihan` bigint unsigned primary key auto increment
- `id_warga` bigint unsigned foreign key, wajib
- `id_iuran_wajib` bigint unsigned foreign key, wajib
- `bulan` tinyint atau integer, wajib
- `tahun` smallint atau integer, wajib
- `status_bayar` enum `Belum Lunas` / `Lunas`, wajib
- `nominal` decimal atau bigint, wajib
- `tanggal_jatuh_tempo` date nullable
- `tanggal_lunas` datetime nullable
- `catatan` text nullable
- `created_at` timestamp nullable
- `updated_at` timestamp nullable

Constraint penting:
- unique gabungan `id_warga`, `id_iuran_wajib`, `bulan`, `tahun`

Makna bisnis:
- satu baris di tabel ini adalah satu kewajiban tagihan
- tabel ini bukan catatan uang masuk

## 5. Tabel `pembayaran_iuran`

Fungsi:
Menyimpan pembayaran aktual atas tagihan warga.

Kolom final yang direkomendasikan:

- `id_pembayaran` bigint unsigned primary key auto increment
- `id_tagihan` bigint unsigned foreign key, wajib
- `id_user` bigint unsigned foreign key, wajib
- `tanggal_bayar` datetime, wajib
- `jumlah_bayar` decimal atau bigint, wajib
- `metode_bayar` varchar nullable
- `bukti_pembayaran` varchar nullable
- `catatan` text nullable
- `created_at` timestamp nullable
- `updated_at` timestamp nullable

Constraint penting:
- `id_tagihan` unik

Makna bisnis:
- karena tidak ada cicilan, satu tagihan hanya boleh punya satu pembayaran
- jika pembayaran berhasil dibuat, tagihan terkait harus diubah menjadi `Lunas`

## 6. Tabel `kategori`

Fungsi:
Menyimpan kategori transaksi kas.

Kolom final minimum:

- `id_kategori` bigint unsigned primary key auto increment
- `nama_kategori` varchar, wajib
- `tipe` enum `Masuk` / `Keluar`, wajib
- `is_active` boolean default true
- `created_at` timestamp nullable
- `updated_at` timestamp nullable

## 7. Tabel `transaksi_kas`

Fungsi:
Mencatat arus uang masuk dan keluar pada kas RT.

Kolom final yang direkomendasikan:

- `id_transaksi` bigint unsigned primary key auto increment
- `id_kategori` bigint unsigned foreign key, wajib
- `id_user` bigint unsigned foreign key, wajib
- `id_tagihan` bigint unsigned foreign key nullable
- `id_pembayaran` bigint unsigned foreign key nullable
- `tgl_transaksi` datetime, wajib
- `jenis_transaksi` enum `Masuk` / `Keluar`, wajib
- `jumlah` decimal atau bigint, wajib
- `keterangan` text nullable
- `bukti_pembayaran` varchar nullable
- `created_at` timestamp nullable
- `updated_at` timestamp nullable

Catatan:
- untuk transaksi kas dari pembayaran iuran, `id_pembayaran` sebaiknya diisi
- untuk transaksi kas umum non-tagihan, `id_tagihan` dan `id_pembayaran` bisa nullable

## 8. Tabel `laporan`

Fungsi:
Menyimpan metadata file laporan yang pernah dihasilkan.

Kolom final yang direkomendasikan:

- `id_laporan` bigint unsigned primary key auto increment
- `id_user` bigint unsigned foreign key, wajib
- `tanggal_awal` date, wajib
- `tanggal_akhir` date, wajib
- `file_path` varchar, wajib
- `created_at` timestamp nullable
- `updated_at` timestamp nullable

Catatan:
- tabel ini opsional untuk penyimpanan histori file laporan
- laporan keuangan tetap bisa dihitung dari query tanpa bergantung penuh pada tabel ini

## Relasi Antar Tabel

- `users` 1..n `pembayaran_iuran`
- `users` 1..n `transaksi_kas`
- `users` 1..n `laporan`
- `warga` 1..n `tagihan_warga`
- `iuran_wajib` 1..n `tagihan_warga`
- `tagihan_warga` 1..1 `pembayaran_iuran`
- `kategori` 1..n `transaksi_kas`
- `pembayaran_iuran` 1..n `transaksi_kas` secara operasional bisa dibuat 1..1 atau 1..n sesuai kebutuhan pencatatan

## Alur Data Inti

### Generate tagihan

1. pilih warga
2. pilih iuran wajib
3. tentukan bulan dan tahun
4. buat baris pada `tagihan_warga`

### Bayar tagihan

1. cek tagihan masih `Belum Lunas`
2. buat baris pada `pembayaran_iuran`
3. update `tagihan_warga.status_bayar` menjadi `Lunas`
4. isi `tagihan_warga.tanggal_lunas`
5. buat baris kas masuk pada `transaksi_kas`

Semua langkah di atas harus dibungkus dalam database transaction.

## Aturan Validasi Penting

### Auth

- login menerima satu field input: `login`
- jika format input email, cari berdasarkan `email`
- jika bukan email, cari berdasarkan `username`
- password wajib diverifikasi dengan hash Laravel

### Tagihan

- tagihan untuk kombinasi warga + iuran + bulan + tahun tidak boleh ganda
- nominal tagihan harus lebih dari nol

### Pembayaran

- pembayaran tidak boleh dibuat jika tagihan sudah lunas
- `jumlah_bayar` harus sama dengan nominal tagihan karena sistem tidak mendukung cicilan
- bukti pembayaran harus divalidasi tipe file dan ukuran file

### Transaksi Kas

- transaksi dari pembayaran iuran harus sinkron dengan `pembayaran_iuran`
- transaksi keluar tidak boleh memakai kategori bertipe `Masuk`
- transaksi masuk tidak boleh memakai kategori bertipe `Keluar`

## Dampak ke Laravel

Schema ini berarti Laravel harus disesuaikan pada beberapa titik:

- model `User` memakai primary key `id_user`
- model bisnis lain juga memakai primary key khusus
- auth Breeze tidak bisa dipakai mentah karena login sekarang berbasis `email` atau `username`
- migration default `users` harus direvisi agar tidak bentrok dengan tabel `users` lama

## Rekomendasi Implementasi Setelah Dokumen Ini

1. revisi konfigurasi dan migration Laravel agar cocok dengan schema ini
2. ubah auth login/register sesuai tabel `users`
3. buat model dan relasi Eloquent
4. lanjutkan CRUD modul bisnis
