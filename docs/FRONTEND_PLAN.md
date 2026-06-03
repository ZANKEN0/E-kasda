# Frontend Plan E-KASDA

Dokumen ini menjadi pegangan implementasi frontend sebelum modul backend project disambungkan penuh ke data asli.

## Acuan Visual Utama

- seluruh frontend mengikuti folder referensi `C:\S-1\Kuliah\Semester 6\Kerja Praktek\UI&UX\UI`
- mapping detail halaman disimpan di [UI_REFERENCE.md](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UI&UX\AppsEkasda\docs\UI_REFERENCE.md)

## Sasaran Fase Awal

- membentuk visual E-KASDA agar sesuai dengan mockup yang sudah disepakati
- mengganti tampilan default Breeze menjadi dashboard administrasi RT
- menjaga frontend tetap fungsional walau backend business logic belum lengkap

## Ruang Lingkup Fase Ini

### 1. Design system dasar

- warna utama E-KASDA
- typography
- button
- input
- badge
- card
- table

### 2. Layout global

- layout pre-login
- layout admin
- sidebar
- topbar
- page shell

### 3. Halaman auth dan pre-login

- landing page
- login
- register

### 4. Dashboard dan modul frontend

- `Dashboard`
- `Data Warga`
- `Iuran Wajib`
- `Tagihan Warga`
- `Pembayaran Iuran`
- `Transaksi Kas`
- `Laporan Keuangan`

## Progress Saat Ini

- landing page selesai
- login selesai
- register selesai
- dashboard utama selesai
- `Data Warga` selesai
- `Iuran Wajib` selesai
- `Tagihan Warga` selesai
- `Pembayaran Iuran` selesai
- `Transaksi Kas` selesai
- `Laporan Keuangan` selesai

## Prinsip Implementasi

- frontend dikerjakan lebih dulu dengan data dummy yang konsisten
- copy harus memakai Bahasa Indonesia
- visual harus terasa seperti sistem administrasi RT yang rapi dan natural
- halaman harus reusable agar modul berikutnya lebih cepat dibangun

## Data Dummy Awal

- Periode utama: `Mei 2026`
- Warga:
  - Budi Santoso
  - Siti Rahma
  - Ahmad Fauzi
  - Lina Marlina
  - Rudi Hartono

## Urutan Implementasi Setelah Fase Ini

1. review visual terhadap folder `UI`
2. koreksi detail spacing dan icon agar makin presisi
3. penyesuaian responsif jika diperlukan
4. setelah disetujui, baru integrasi data/backend

## Catatan Teknis

- path project asli mengandung karakter `&`, jadi command frontend di Windows kadang perlu jalur alias `C:\ekasda-dev`
- route placeholder untuk modul selain dashboard boleh tampil dulu sebagai shell UI, lalu disambungkan bertahap ke backend
