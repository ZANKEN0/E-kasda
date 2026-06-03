<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $defaults = [
            ['nama_kategori' => 'Pembayaran Iuran', 'tipe' => 'Masuk'],
            ['nama_kategori' => 'Donasi Warga', 'tipe' => 'Masuk'],
            ['nama_kategori' => 'Operasional RT', 'tipe' => 'Keluar'],
            ['nama_kategori' => 'Kebersihan', 'tipe' => 'Keluar'],
            ['nama_kategori' => 'Keamanan', 'tipe' => 'Keluar'],
            ['nama_kategori' => 'Sosial', 'tipe' => 'Keluar'],
        ];

        foreach ($defaults as $item) {
            $exists = DB::table('kategori')
                ->where('nama_kategori', $item['nama_kategori'])
                ->where('tipe', $item['tipe'])
                ->exists();

            if (! $exists) {
                DB::table('kategori')->insert([
                    'nama_kategori' => $item['nama_kategori'],
                    'tipe' => $item['tipe'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('kategori')
            ->whereIn('nama_kategori', [
                'Pembayaran Iuran',
                'Donasi Warga',
                'Operasional RT',
                'Kebersihan',
                'Keamanan',
                'Sosial',
            ])
            ->delete();
    }
};