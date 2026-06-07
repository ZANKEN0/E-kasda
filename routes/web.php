<?php

use App\Http\Controllers\AccountApprovalController;
use App\Http\Controllers\ApprovalPendingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\IuranWajibController;
use App\Http\Controllers\LaporanKeuanganController;
use App\Http\Controllers\PembayaranIuranController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TagihanWargaController;
use App\Http\Controllers\TransaksiKasController;
use App\Http\Controllers\WargaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'active', 'verified'])->group(function () {
    Route::get('/approval-pending', ApprovalPendingController::class)
        ->name('approval.pending');
});

Route::middleware(['auth', 'active', 'verified', 'approved'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/pencarian', GlobalSearchController::class)->name('global-search');

    Route::middleware('role:Ketua_RT,Bendahara')->group(function () {
        Route::get('/data-warga', [WargaController::class, 'index'])->name('data-warga');
        Route::get('/data-warga/export', [WargaController::class, 'export'])->name('data-warga.export');
        Route::get('/iuran-wajib', [IuranWajibController::class, 'index'])->name('iuran-wajib');
        Route::get('/tagihan-warga', [TagihanWargaController::class, 'index'])->name('tagihan-warga');
        Route::get('/tagihan-warga/export', [TagihanWargaController::class, 'export'])->name('tagihan-warga.export');
        Route::get('/pembayaran-iuran', [PembayaranIuranController::class, 'index'])->name('pembayaran-iuran');
        Route::get('/pembayaran-iuran/{pembayaranIuran}/kwitansi', [PembayaranIuranController::class, 'receiptPdf'])->name('pembayaran-iuran.receipt');
        Route::get('/transaksi-kas', [TransaksiKasController::class, 'index'])->name('transaksi-kas');
        Route::get('/laporan-keuangan', [LaporanKeuanganController::class, 'index'])->name('laporan-keuangan');
        Route::get('/laporan-keuangan/export', [LaporanKeuanganController::class, 'export'])->name('laporan-keuangan.export');
        Route::get('/laporan-keuangan/export-pdf', [LaporanKeuanganController::class, 'exportPdf'])->name('laporan-keuangan.export-pdf');
    });

    Route::middleware('role:Ketua_RT')->group(function () {
        Route::get('/persetujuan-akun', [AccountApprovalController::class, 'index'])->name('approval.index');
        Route::post('/persetujuan-akun/manual', [AccountApprovalController::class, 'store'])->name('approval.store');
        Route::post('/persetujuan-akun/cleanup-unverified', [AccountApprovalController::class, 'cleanupUnverified'])->name('approval.cleanup-unverified');
        Route::patch('/persetujuan-akun/{user}/approve', [AccountApprovalController::class, 'approve'])->name('approval.approve');
        Route::patch('/persetujuan-akun/{user}/toggle-active', [AccountApprovalController::class, 'toggleActive'])->name('approval.toggle-active');
        Route::put('/persetujuan-akun/{user}', [AccountApprovalController::class, 'update'])->name('approval.update');
        Route::post('/persetujuan-akun/{user}/hapus', [AccountApprovalController::class, 'destroy'])->name('approval.destroy');

        Route::post('/data-warga', [WargaController::class, 'store'])->name('data-warga.store');
        Route::get('/data-warga/template', [WargaController::class, 'template'])->name('data-warga.template');
        Route::post('/data-warga/import', [WargaController::class, 'import'])->name('data-warga.import');
        Route::put('/data-warga/{warga}', [WargaController::class, 'update'])->name('data-warga.update');
        Route::delete('/data-warga/{warga}', [WargaController::class, 'destroy'])->name('data-warga.destroy');

        Route::post('/iuran-wajib', [IuranWajibController::class, 'store'])->name('iuran-wajib.store');
        Route::put('/iuran-wajib/{iuranWajib}', [IuranWajibController::class, 'update'])->name('iuran-wajib.update');
        Route::patch('/iuran-wajib/{iuranWajib}/toggle-status', [IuranWajibController::class, 'toggleStatus'])->name('iuran-wajib.toggle-status');
        Route::delete('/iuran-wajib/{iuranWajib}', [IuranWajibController::class, 'destroy'])->name('iuran-wajib.destroy');
    });

    Route::middleware('role:Ketua_RT,Bendahara')->group(function () {
        Route::post('/tagihan-warga', [TagihanWargaController::class, 'store'])->name('tagihan-warga.store');
        Route::put('/tagihan-warga/{tagihanWarga}', [TagihanWargaController::class, 'update'])->name('tagihan-warga.update');
        Route::delete('/tagihan-warga/{tagihanWarga}', [TagihanWargaController::class, 'destroy'])->name('tagihan-warga.destroy');

        Route::post('/pembayaran-iuran', [PembayaranIuranController::class, 'store'])->name('pembayaran-iuran.store');

        Route::post('/transaksi-kas', [TransaksiKasController::class, 'store'])->name('transaksi-kas.store');
        Route::put('/transaksi-kas/{transaksiKa}', [TransaksiKasController::class, 'update'])->name('transaksi-kas.update');
    });

});

Route::middleware(['auth', 'active'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
