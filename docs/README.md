# Dokumentasi E-KASDA

Folder ini menyimpan dokumentasi kerja untuk project `E-KASDA`.

## Isi Dokumentasi

- [Rundown pengembangan](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\RUNDOWN.md)
- [Rencana frontend fase awal](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\FRONTEND_PLAN.md)
- [Acuan visual halaman](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\UI_REFERENCE.md)
- [Catatan setup environment](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\SETUP_NOTES.md)
- [Panduan public testing dengan Cloudflare Tunnel](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\PUBLIC_TESTING_TUNNEL.md)
- [Laporan test public tunnel](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\TEST_REPORT_PUBLIC_TUNNEL.md)
- [Registry akun testing dan pengembangan](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\ACCOUNT_REGISTRY.md)
- [SOP pengguna E-KASDA](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\SOP_PENGGUNA_EKASDA.md)
- [Rencana dan hasil backend tahap 1](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\BACKEND_STAGE_1_PLAN.md)
- [Schema final database `ekasda`](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\SCHEMA_FINAL_EKASDA.md)
- [Tracker implementasi fitur dan progress](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\IMPLEMENTATION_TRACKER.md)

## Status Saat Ini

- Stack dasar aktif: `Laravel 12 + Inertia React + TypeScript + MySQL`
- UI utama sudah mengikuti mockup dan siap dihubungkan ke data nyata
- Fondasi auth sekarang sudah disesuaikan untuk schema `ekasda`
- Login dirancang memakai `email` atau `username`
- Database aktif project sekarang adalah `ekasda`
- Driver transisi yang dipakai saat ini:
  - `SESSION_DRIVER=file`
  - `CACHE_STORE=file`
  - `QUEUE_CONNECTION=sync`
- Migration sinkronisasi tahap 1 sudah dijalankan ke database `ekasda`
- Tabel `pembayaran_iuran` sudah berhasil dibuat
- Export `CSV` sudah aktif untuk `Data Warga`, `Tagihan Warga`, dan `Laporan Keuangan`
- Import `Data Warga` dari CSV kompatibel Excel sudah aktif
- Throttle register sudah aktif untuk mengurangi spam pendaftaran
- Approval akun setelah verifikasi email sudah aktif
- Public testing lewat Cloudflare Tunnel sudah terdokumentasi

## Catatan Singkat

Tahap backend sekarang sudah melewati sinkronisasi awal database dan Laravel. Langkah berikutnya adalah mulai implementasi modul bisnis dan mengganti data dummy frontend dengan data nyata dari database.

Untuk public testing melalui tunnel, baca juga catatan `.env` dan checklist publik di:

- [Panduan public testing dengan Cloudflare Tunnel](C:\S-1\Kuliah\Semester 6\Kerja Praktek\UIUX\AppsEkasda\docs\PUBLIC_TESTING_TUNNEL.md)
