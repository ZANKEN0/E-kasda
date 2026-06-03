<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class EmailVerificationCooldown
{
    /**
     * @var array<int, int>
     */
    private const FIBONACCI_SECONDS = [30, 30, 60, 90, 150, 240, 390, 630];

    private const RESET_AFTER_SECONDS = 3600;

    public static function remainingSeconds(User $user): int
    {
        $state = self::state($user);
        $availableAt = (int) ($state['available_at'] ?? 0);

        return max(0, $availableAt - now()->timestamp);
    }

    public static function startOrAdvance(User $user): int
    {
        $state = self::state($user);
        $now = now()->timestamp;
        $lastSentAt = (int) ($state['last_sent_at'] ?? 0);
        $attempts = (int) ($state['attempts'] ?? 0);

        if ($lastSentAt === 0 || ($now - $lastSentAt) > self::RESET_AFTER_SECONDS) {
            $attempts = 0;
        }

        $attempts++;
        $cooldown = self::secondsForAttempt($attempts);

        Cache::put(self::cacheKey($user), [
            'attempts' => $attempts,
            'last_sent_at' => $now,
            'available_at' => $now + $cooldown,
        ], now()->addDay());

        return $cooldown;
    }

    private static function secondsForAttempt(int $attempts): int
    {
        $index = min(max($attempts - 1, 0), count(self::FIBONACCI_SECONDS) - 1);

        return self::FIBONACCI_SECONDS[$index];
    }

    /**
     * @return array<string, int>
     */
    private static function state(User $user): array
    {
        return Cache::get(self::cacheKey($user), []);
    }

    private static function cacheKey(User $user): string
    {
        return 'verification-resend:'.$user->getKey();
    }
}
