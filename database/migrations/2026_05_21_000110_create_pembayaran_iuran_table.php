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
        if (! Schema::hasTable('pembayaran_iuran')) {
            Schema::create('pembayaran_iuran', function (Blueprint $table) {
                $table->id('id_pembayaran');
                $table->integer('id_tagihan')->unique();
                $table->integer('id_user');
                $table->dateTime('tanggal_bayar');
                $table->decimal('jumlah_bayar', 15, 2);
                $table->string('metode_bayar')->nullable();
                $table->string('bukti_pembayaran')->nullable();
                $table->text('catatan')->nullable();
                $table->timestamps();

                $table->foreign('id_tagihan')
                    ->references('id_tagihan')
                    ->on('tagihan_warga')
                    ->cascadeOnUpdate()
                    ->cascadeOnDelete();

                $table->foreign('id_user')
                    ->references('id_user')
                    ->on('users')
                    ->cascadeOnUpdate()
                    ->restrictOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran_iuran');
    }
};