# Tracker Implementasi E-KASDA

Dokumen ini dipakai untuk memantau progres implementasi fitur, status yang sudah aktif, dan langkah berikutnya yang disarankan.

## Ringkasan Saat Ini

- Baseline saat ini: `Backend Stabil` per `31 Mei 2026`
- Stack utama: `Laravel 12 + Inertia React + TypeScript + MySQL`
- Database aktif: `ekasda`
- Auth login: `email` atau `username`
- Verifikasi email: aktif
- Role final:
  - `Ketua_RT`
  - `Bendahara`

## Fitur Yang Sudah Aktif

### Auth dan Keamanan Dasar

- Register publik aktif
- Email verification aktif
- Login dengan `email` atau `username`
- Middleware `verified` aktif untuk modul utama
- Throttle register aktif:
  - batas `5` percobaan per menit
  - pesan error ramah user jika melebihi batas
- Anti-spam resend email verifikasi aktif:
  - cooldown backend per akun
  - countdown frontend pada halaman verifikasi
  - backoff bertahap model Fibonacci dimulai dari `30` detik
- Toggle tampil/sembunyi kata sandi sudah aktif di area penting:
  - login
  - register
  - atur ulang kata sandi
  - ubah kata sandi profil
  - form akun manual di `Kelola Akun`
  - konfirmasi hapus akun di `Kelola Akun`
- Approval akun aktif:
  - setelah verify email, akun masuk status menunggu persetujuan
  - `Ketua_RT` yang sudah approved dapat menyetujui atau menolak akun
  - role final akun dipilih saat approval, bukan saat register publik
  - akun `Ketua_RT` pertama akan otomatis menjadi bootstrap approver setelah email verified agar sistem tidak terkunci
- UI auth dan profile utama sudah lebih konsisten memakai Bahasa Indonesia:
  - `Lupa Kata Sandi`
  - `Konfirmasi Kata Sandi`
  - `Atur Ulang Kata Sandi`
  - `Profil Saya`
  - `Ubah Kata Sandi`
  - `Hapus Akun`
- Locale aplikasi sekarang menggunakan Bahasa Indonesia untuk pesan bawaan Laravel:
  - validasi form
  - login throttle
  - reset kata sandi
  - pesan `required`, `taken`, `confirmed`, dan sejenisnya
- Halaman `Profil Saya` sekarang menampilkan:
  - status verifikasi akun
  - nomor telepon akun pengurus
- Popup notifikasi bawah (toast) sekarang aktif secara global untuk flash:
  - `success`
  - `error`
  - muncul langsung di layar tanpa harus scroll ke atas

### Master Data

- CRUD `Data Warga`
- Import `Data Warga` dari CSV kompatibel Excel:
  - unduh template CSV
  - upload CSV
  - preview data sebelum simpan
  - validasi dasar pada nama, nomor rumah, nomor telepon, dan status hunian
- CRUD `Iuran Wajib`
- Role-aware UI:
  - `Ketua_RT` bisa mengelola master
  - `Bendahara` hanya lihat master tertentu

### Tagihan

- CRUD `Tagihan Warga`
- Edit manual tidak bisa mengubah tagihan lunas
- Generate tagihan:
  - `Satu warga`
  - `Semua warga`
- Cegah duplikasi tagihan berdasarkan warga + iuran + bulan + tahun

### Pembayaran

- Pembayaran per warga
- Pembayaran massal per periode
- Sinkron otomatis ke:
  - `pembayaran_iuran`
  - `tagihan_warga`
  - `transaksi_kas`

### Kas, Dashboard, dan Laporan

- Dashboard memakai data nyata
- Laporan keuangan memakai data nyata
- Ringkasan kas dan transaksi sudah terhubung
- Halaman `Transaksi Kas` sudah dirapikan:
  - form transaksi tampil sebagai card penuh saat dibutuhkan
  - tabel riwayat transaksi menjadi fokus utama dan memakai lebar penuh
  - ringkasan kas tampil lebih dulu agar cepat dibaca

### Pencarian Global

- Search bar header sekarang sudah aktif
- Hasil pencarian global menampilkan ringkasan dari:
  - `Data Warga`
  - `Tagihan Warga`
  - `Transaksi Kas`
  - `Kelola Akun` untuk `Ketua_RT`
- Hasil pencarian dibuka melalui halaman `Hasil Pencarian`
- Setiap hasil dapat diarahkan kembali ke modul terkait

### Export

- Export `Data Warga` ke CSV
- Template import `Data Warga` ke CSV
- Export `Tagihan Warga` ke CSV
- Export `Laporan Keuangan` ke CSV

### Public Testing

- Public testing sementara lewat Cloudflare Tunnel sudah terdokumentasi
- Panduan menjalankan tunnel tersedia di:
  - `docs/PUBLIC_TESTING_TUNNEL.md`
- Laporan hasil test tunnel tersedia di:
  - `docs/TEST_REPORT_PUBLIC_TUNNEL.md`
- Alur testing publik memakai:
  - `npm run build`
  - `php artisan serve`
  - `cloudflared tunnel --url http://127.0.0.1:8000`

### Persetujuan Akun

- Halaman pending approval untuk user yang belum disetujui
- Halaman `Persetujuan Akun` untuk `Ketua_RT`
- Aksi:
  - setujui akun
  - tolak dan hapus akun pending

### Pengaturan dan Kelola Akun

- Dropdown `Pengaturan` sudah aktif
- Menu `Pengaturan` sekarang menampilkan:
  - `Profil Saya`
  - `Kelola Akun` untuk `Ketua_RT`
  - `Logout`
- Logout sekarang memakai modal konfirmasi internal sebelum keluar
- Dialog browser bawaan seperti `127.0.0.1 says` sudah diganti dengan modal konfirmasi internal pada aksi penting:
  - `Logout`
  - hapus `Data Warga`
  - hapus `Iuran Wajib`
  - hapus `Tagihan Warga`
  - cleanup akun lama di `Kelola Akun`
- Halaman `Kelola Akun` sekarang mendukung:
  - tambah akun manual
  - edit data akun
  - ubah role akun
  - aktifkan atau nonaktifkan akun
  - hapus akun
  - approve akun pending
  - isi dan lihat nomor telepon akun pengurus
- Akun manual yang dibuat oleh `Ketua_RT` sekarang:
  - langsung `verified`
  - langsung `approved`
  - bisa langsung dipakai login tanpa klik email verifikasi
- Pengaman aktif:
  - tidak bisa hapus akun yang sedang login
  - tidak bisa nonaktifkan akun yang sedang login
  - akun `Ketua_RT` terakhir tidak boleh dihapus
  - akun `Ketua_RT` aktif terakhir tidak boleh dinonaktifkan
  - akun `Ketua_RT` terakhir tidak boleh diubah menjadi `Bendahara`
  - hapus akun dari `Kelola Akun` sekarang meminta kata sandi `Ketua_RT` yang sedang login
- Akun nonaktif sekarang:
  - tidak bisa login
  - otomatis ditolak dari middleware akses jika masih punya sesi lama
- Cleanup manual akun belum verifikasi sudah aktif:
  - hanya untuk `Ketua_RT`
  - hanya membersihkan akun `email_verified_at = null`
  - hanya jika umur akun lebih dari `4` hari
  - tersedia tombol ramah pengguna di halaman `Kelola Akun`

### Dokumentasi Akun

- Registry akun testing sudah dibuat di:
  - `docs/ACCOUNT_REGISTRY.md`
- SOP pengguna sudah dibuat di:
  - `docs/SOP_PENGGUNA_EKASDA.md`
- Dokumen ini dipakai untuk melacak akun mana yang:
  - sudah verified
  - sudah approved
  - masih pending
  - hanya akun test

## Route Export Aktif

- `data-warga/export`
- `tagihan-warga/export`
- `laporan-keuangan/export`

## Catatan Operasional

- Format export saat ini adalah `CSV`
- File CSV dapat langsung dibuka di Excel
- Export mengikuti filter aktif di halaman terkait
- Email verifikasi sekarang dikirim melalui SMTP Gmail yang sudah dikonfigurasi

## Checklist Uji Cepat

### Auth

- daftar akun baru
- cek email verifikasi masuk
- klik link verifikasi
- pastikan form register publik tidak lagi menampilkan pilihan role
- login dengan username
- login dengan email
- pastikan akun baru yang belum disetujui masuk ke halaman `menunggu persetujuan`
- set role final dari halaman approval
- setujui akun dari halaman `Persetujuan Akun`
- login ulang dan pastikan akun yang sudah disetujui bisa masuk dashboard

### Master dan Tagihan

- tambah warga
- unduh template import warga
- import warga dari CSV
- tambah iuran wajib
- buat tagihan satu warga
- buat tagihan semua warga
- pastikan tagihan dobel ditolak atau dilewati

### Pembayaran

- bayar tagihan satu warga
- bayar tagihan massal per periode
- cek status tagihan berubah jadi `Lunas`
- cek transaksi kas masuk tercatat

### Laporan dan Export

- buka laporan keuangan per bulan
- unduh CSV laporan
- unduh CSV data warga
- unduh CSV tagihan

### Public Testing

- build frontend untuk mode publik
- jalankan Laravel server
- jalankan Cloudflare Tunnel
- ubah `APP_URL` ke URL `trycloudflare`
- cek register dan email verifikasi dari link publik

## Langkah Berikutnya Yang Disarankan

1. Rapikan UI mobile lintas halaman utama
2. Export format `.xlsx` jika dibutuhkan styling Excel yang lebih rapi
3. Audit akhir UX untuk form, empty state, dan feedback batch
4. Tambah dokumentasi role dan SOP pengujian
5. Pertimbangkan fitur catatan alasan penolakan akun
6. Pertimbangkan deploy staging permanen jika testing publik sudah rutin

## File Penting Yang Sudah Banyak Berubah

- `app/Http/Controllers/*`
- `app/Http/Requests/*`
- `app/Models/*`
- `resources/js/Pages/*`
- `routes/web.php`
- `routes/auth.php`
- `.env`

## Catatan Tracking

Dokumen ini sebaiknya diperbarui setiap kali ada:

- fitur baru aktif
- perubahan role atau keamanan
- perubahan alur bisnis utama
- route export/import baru
