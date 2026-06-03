# SOP Pengguna E-KASDA

Dokumen ini berisi panduan penggunaan E-KASDA untuk pengguna non-teknis. Fokusnya adalah urutan kerja yang benar agar data tetap rapi dan alur operasional RT berjalan lancar.

## Peran Pengguna

### `Ketua_RT`

Hak akses utama:
- menyetujui akun baru
- mengelola akun pengurus
- mengelola data warga
- mengelola iuran wajib
- mengelola tagihan warga
- mencatat pembayaran
- melihat kas, dashboard, dan laporan

### `Bendahara`

Hak akses operasional:
- melihat data warga
- melihat iuran wajib
- mengelola tagihan warga
- mencatat pembayaran iuran
- mengelola transaksi kas
- melihat dashboard dan laporan

## Alur Akun Baru

### Daftar akun baru

1. Buka halaman `Register`.
2. Isi:
   - nama lengkap
   - username
   - email
   - kata sandi
3. Klik tombol daftar.
4. Sistem akan mengirim email verifikasi.

### Verifikasi email

1. Buka email yang dipakai saat daftar.
2. Klik tautan verifikasi.
3. Setelah berhasil, akun akan masuk status `menunggu persetujuan`.

### Persetujuan oleh `Ketua_RT`

1. Login sebagai `Ketua_RT`.
2. Buka `Pengaturan -> Kelola Akun`.
3. Lihat daftar akun yang menunggu persetujuan.
4. Tentukan role akun:
   - `Ketua_RT`
   - `Bendahara`
5. Klik `Setujui`.
6. Setelah disetujui, pengguna bisa login ke sistem.

## Alur Akun Manual Oleh `Ketua_RT`

1. Login sebagai `Ketua_RT`.
2. Buka `Pengaturan -> Kelola Akun`.
3. Klik `Tambah Akun Manual`.
4. Isi:
   - nama lengkap
   - username
   - email
   - nomor telepon
   - role
   - kata sandi awal
5. Simpan data akun.

Catatan:
- akun manual langsung `verified`
- akun manual langsung `approved`
- akun bisa langsung dipakai login

## Alur Master Data

### Tambah data warga

1. Login sebagai `Ketua_RT`.
2. Buka menu `Data Warga`.
3. Klik `Tambah Warga`.
4. Isi:
   - nama warga
   - nomor rumah
   - nomor telepon
   - status hunian
5. Klik simpan.

Catatan:
- gunakan format nomor rumah yang konsisten, misalnya `Blok A / No. 12`
- data warga yang sudah memiliki tagihan tidak bisa dihapus sembarangan

### Tambah iuran wajib

1. Login sebagai `Ketua_RT`.
2. Buka menu `Iuran Wajib`.
3. Klik `Tambah Komponen Iuran`.
4. Isi:
   - nama iuran
   - nominal default
   - periode
   - status aktif
5. Klik simpan.

Contoh:
- Iuran kebersihan
- Iuran keamanan
- Iuran lampu jalan

## Alur Tagihan

### Buat tagihan satu warga

1. Buka menu `Tagihan Warga`.
2. Klik `Buat Tagihan Baru`.
3. Pilih mode `Satu warga`.
4. Pilih warga.
5. Pilih iuran wajib.
6. Pilih bulan dan tahun.
7. Isi nominal dan tanggal jatuh tempo.
8. Simpan.

### Buat tagihan semua warga

1. Buka menu `Tagihan Warga`.
2. Klik `Buat Tagihan Baru`.
3. Pilih mode `Semua warga`.
4. Pilih iuran wajib.
5. Pilih bulan dan tahun.
6. Isi nominal dan tanggal jatuh tempo.
7. Simpan.

Catatan:
- sistem akan melewati tagihan yang sudah ada pada kombinasi warga + iuran + bulan + tahun yang sama
- gunakan filter bulan dan tahun untuk mengecek hasilnya

## Alur Pembayaran Iuran

### Pembayaran per warga

1. Buka menu `Pembayaran Iuran`.
2. Pilih mode `Per Warga`.
3. Pilih warga.
4. Pilih tagihan yang akan dibayar.
5. Pastikan jumlah bayar sesuai total tagihan.
6. Simpan pembayaran.

### Pembayaran massal per periode

1. Buka menu `Pembayaran Iuran`.
2. Pilih mode `Massal per Periode`.
3. Pilih bulan dan tahun.
4. Jika perlu, pilih jenis iuran.
5. Tampilkan data tagihan.
6. Centang tagihan yang dibayar.
7. Simpan pembayaran.

Catatan:
- sistem tidak mendukung cicilan
- nominal pembayaran harus sesuai
- setelah pembayaran berhasil:
  - tagihan menjadi `Lunas`
  - transaksi kas masuk tercatat otomatis

## Alur Transaksi Kas

### Tambah transaksi manual

1. Buka menu `Transaksi Kas`.
2. Klik `Tambah Transaksi`.
3. Isi:
   - tanggal transaksi
   - jenis transaksi
   - kategori
   - jumlah
   - keterangan
4. Simpan.

Catatan:
- gunakan transaksi manual untuk kas masuk/keluar di luar pembayaran iuran
- pembayaran iuran yang dicatat dari modul pembayaran akan otomatis masuk ke kas

## Dashboard dan Laporan

### Dashboard

Dashboard dipakai untuk melihat ringkasan cepat:
- saldo kas
- pemasukan bulan ini
- pengeluaran bulan ini
- jumlah warga aktif
- tunggakan warga
- transaksi terbaru

### Laporan keuangan

1. Buka menu `Laporan Keuangan`.
2. Pilih bulan dan tahun.
3. Periksa:
   - saldo awal
   - pemasukan
   - pengeluaran
   - saldo akhir
   - daftar transaksi
4. Jika perlu, unduh CSV.

## Pengelolaan Akun

### Edit akun

1. Buka `Pengaturan -> Kelola Akun`.
2. Cari akun yang ingin diubah.
3. Klik `Edit`.
4. Ubah data yang diperlukan.
5. Simpan perubahan.

### Hapus akun

1. Buka `Pengaturan -> Kelola Akun`.
2. Klik `Hapus` pada akun yang dipilih.
3. Masukkan kata sandi `Ketua_RT` yang sedang login.
4. Konfirmasi penghapusan.

Catatan:
- akun yang sedang login tidak bisa dihapus
- akun `Ketua_RT` terakhir tidak bisa dihapus

### Bersihkan akun lama yang belum verifikasi

1. Buka `Pengaturan -> Kelola Akun`.
2. Lihat blok `Bersihkan Akun Belum Verifikasi`.
3. Periksa jumlah akun yang siap dibersihkan.
4. Klik `Bersihkan Akun Lama`.
5. Konfirmasi tindakan.

Aturan pembersihan:
- hanya akun yang belum verifikasi email
- hanya akun yang lebih dari `4` hari
- dijalankan manual oleh `Ketua_RT`

## Notifikasi dan Konfirmasi

- notifikasi berhasil/gagal tampil sebagai popup kecil di kanan bawah
- aksi penting seperti hapus data dan logout memakai modal konfirmasi internal

## Tips Penggunaan

- gunakan data email yang benar saat register
- cek status akun di `Profil Saya`
- gunakan filter pada `Data Warga`, `Tagihan Warga`, dan `Laporan Keuangan`
- lakukan pembayaran dari modul `Pembayaran Iuran`, bukan dengan mengubah status manual
- gunakan export CSV jika perlu rekap cepat di Excel

## Checklist Operasional Bulanan

1. cek data warga terbaru
2. cek komponen iuran aktif
3. buat tagihan periode baru
4. pantau pembayaran yang masuk
5. cek transaksi kas
6. buka dashboard
7. tutup bulan dengan laporan keuangan

## Jika Ada Masalah

### Tidak bisa login

- cek pakai email atau username yang benar
- cek kata sandi
- pastikan akun sudah disetujui
- pastikan email sudah diverifikasi

### Tidak menerima email verifikasi

- cek folder spam
- gunakan tombol kirim ulang di halaman verifikasi
- tunggu cooldown sebelum mengirim ulang lagi

### Akun baru belum bisa masuk

Kemungkinan penyebab:
- email belum diverifikasi
- akun belum disetujui `Ketua_RT`

### Data tidak muncul di laporan

- cek filter bulan dan tahun
- pastikan transaksi atau pembayaran memang sudah tersimpan

## Penutup

Gunakan urutan kerja sesuai SOP ini agar:
- data tetap konsisten
- laporan tidak meleset
- pekerjaan `Ketua_RT` dan `Bendahara` lebih rapi
- proses testing dan demo lebih mudah diikuti
