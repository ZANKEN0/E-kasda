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
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE warga MODIFY nama VARCHAR(100) NOT NULL');
        DB::statement('ALTER TABLE warga MODIFY no_rumah VARCHAR(100) NULL');
        DB::statement('ALTER TABLE warga MODIFY no_telepon VARCHAR(20) NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE warga MODIFY no_rumah VARCHAR(5) NULL');
        DB::statement('ALTER TABLE warga MODIFY no_telepon VARCHAR(15) NULL');
    }
};
