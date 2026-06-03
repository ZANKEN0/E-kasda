<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\EmailVerificationCooldown;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $cooldownSeconds = EmailVerificationCooldown::remainingSeconds($request->user());

        if ($cooldownSeconds > 0) {
            return back()
                ->with('status', 'verification-link-throttled')
                ->with('cooldown_seconds', $cooldownSeconds);
        }

        $request->user()->sendEmailVerificationNotification();
        $nextCooldown = EmailVerificationCooldown::startOrAdvance($request->user());

        return back()
            ->with('status', 'verification-link-sent')
            ->with('cooldown_seconds', $nextCooldown);
    }
}
