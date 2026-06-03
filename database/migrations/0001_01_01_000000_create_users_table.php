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
        if (! Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id('id_user');
                $table->string('username')->unique();
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->string('nama_lengkap');
                $table->string('role');
                $table->rememberToken();
                $table->timestamps();
            });
        } else {
            Schema::table('users', function (Blueprint $table) {
                if (! Schema::hasColumn('users', 'username')) {
                    $table->string('username')->unique()->after('id_user');
                }

                if (! Schema::hasColumn('users', 'email')) {
                    $table->string('email')->unique()->after('username');
                }

                if (! Schema::hasColumn('users', 'email_verified_at')) {
                    $table->timestamp('email_verified_at')->nullable()->after('email');
                }

                if (! Schema::hasColumn('users', 'nama_lengkap')) {
                    $table->string('nama_lengkap')->after('password');
                }

                if (! Schema::hasColumn('users', 'role')) {
                    $table->string('role')->after('nama_lengkap');
                }

                if (! Schema::hasColumn('users', 'remember_token')) {
                    $table->rememberToken()->after('role');
                }

                if (! Schema::hasColumn('users', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }

                if (! Schema::hasColumn('users', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }
            });
        }

        if (! Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (! Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
    }
};