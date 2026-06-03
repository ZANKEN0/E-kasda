<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        RateLimiter::for('register', function (Request $request) {
            $email = strtolower((string) $request->input('email', 'guest'));
            $key = $email.'|'.$request->ip();

            return Limit::perMinute(5)->by($key)->response(function (Request $request) {
                return back()
                    ->withInput($request->except(['password', 'password_confirmation']))
                    ->withErrors([
                        'email' => 'Terlalu banyak percobaan pendaftaran. Tunggu 1 menit lalu coba lagi.',
                    ]);
            });
        });
    }
}
