<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('warga')) {
            Schema::create('warga', function (Blueprint $table) {
                $table->id('id_warga');
                $table->string('nama');
                $table->string('no_rumah');
                $table->string('no_telepon')->nullable();
                $table->enum('status_hunian', ['Tetap', 'Kontrak']);
                $table->timestamps();
            });
        } else {
            Schema::table('warga', function (Blueprint $table) {
                if (! Schema::hasColumn('warga', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }

                if (! Schema::hasColumn('warga', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }
            });
        }

        if (! Schema::hasTable('iuran_wajib')) {
            Schema::create('iuran_wajib', function (Blueprint $table) {
                $table->id('id_iuran_wajib');
                $table->string('nama_iuran');
                $table->decimal('nominal_default', 15, 2);
                $table->string('periode');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        } else {
            Schema::table('iuran_wajib', function (Blueprint $table) {
                if (! Schema::hasColumn('iuran_wajib', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('periode');
                }

                if (! Schema::hasColumn('iuran_wajib', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }

                if (! Schema::hasColumn('iuran_wajib', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }
            });
        }

        if (! Schema::hasTable('kategori')) {
            Schema::create('kategori', function (Blueprint $table) {
                $table->id('id_kategori');
                $table->string('nama_kategori');
                $table->enum('tipe', ['Masuk', 'Keluar']);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        } else {
            Schema::table('kategori', function (Blueprint $table) {
                if (! Schema::hasColumn('kategori', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('tipe');
                }

                if (! Schema::hasColumn('kategori', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }

                if (! Schema::hasColumn('kategori', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }
            });
        }

        if (! Schema::hasTable('tagihan_warga')) {
            Schema::create('tagihan_warga', function (Blueprint $table) {
                $table->id('id_tagihan');
                $table->foreignId('id_warga')->constrained('warga', 'id_warga')->cascadeOnUpdate()->cascadeOnDelete();
                $table->foreignId('id_iuran_wajib')->constrained('iuran_wajib', 'id_iuran_wajib')->cascadeOnUpdate()->cascadeOnDelete();
                $table->unsignedTinyInteger('bulan');
                $table->unsignedSmallInteger('tahun');
                $table->enum('status_bayar', ['Belum Lunas', 'Lunas'])->default('Belum Lunas');
                $table->decimal('nominal', 15, 2);
                $table->date('tanggal_jatuh_tempo')->nullable();
                $table->dateTime('tanggal_lunas')->nullable();
                $table->text('catatan')->nullable();
                $table->timestamps();
                $table->unique(['id_warga', 'id_iuran_wajib', 'bulan', 'tahun'], 'tagihan_warga_unique_per_periode');
            });
        } else {
            Schema::table('tagihan_warga', function (Blueprint $table) {
                if (! Schema::hasColumn('tagihan_warga', 'tanggal_jatuh_tempo')) {
                    $table->date('tanggal_jatuh_tempo')->nullable()->after('nominal');
                }

                if (! Schema::hasColumn('tagihan_warga', 'tanggal_lunas')) {
                    $table->dateTime('tanggal_lunas')->nullable()->after('tanggal_jatuh_tempo');
                }

                if (! Schema::hasColumn('tagihan_warga', 'catatan')) {
                    $table->text('catatan')->nullable()->after('tanggal_lunas');
                }

                if (! Schema::hasColumn('tagihan_warga', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }

                if (! Schema::hasColumn('tagihan_warga', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }
            });
        }

        if (! Schema::hasTable('transaksi_kas')) {
            Schema::create('transaksi_kas', function (Blueprint $table) {
                $table->id('id_transaksi');
                $table->foreignId('id_kategori')->constrained('kategori', 'id_kategori')->cascadeOnUpdate()->restrictOnDelete();
                $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnUpdate()->restrictOnDelete();
                $table->foreignId('id_tagihan')->nullable()->constrained('tagihan_warga', 'id_tagihan')->cascadeOnUpdate()->nullOnDelete();
                $table->unsignedBigInteger('id_pembayaran')->nullable();
                $table->dateTime('tgl_transaksi');
                $table->enum('jenis_transaksi', ['Masuk', 'Keluar']);
                $table->decimal('jumlah', 15, 2);
                $table->text('keterangan')->nullable();
                $table->string('bukti_pembayaran')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('transaksi_kas', function (Blueprint $table) {
                if (! Schema::hasColumn('transaksi_kas', 'id_pembayaran')) {
                    $table->unsignedBigInteger('id_pembayaran')->nullable()->after('id_tagihan');
                }

                if (! Schema::hasColumn('transaksi_kas', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }

                if (! Schema::hasColumn('transaksi_kas', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }
            });
        }

        if (! Schema::hasTable('laporan')) {
            Schema::create('laporan', function (Blueprint $table) {
                $table->id('id_laporan');
                $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnUpdate()->restrictOnDelete();
                $table->date('tanggal_awal');
                $table->date('tanggal_akhir');
                $table->string('file_path');
                $table->timestamps();
            });
        } else {
            Schema::table('laporan', function (Blueprint $table) {
                if (! Schema::hasColumn('laporan', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }

                if (! Schema::hasColumn('laporan', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Sinkronisasi schema lama sengaja tidak di-rollback otomatis untuk menghindari kehilangan struktur bisnis.
    }
};