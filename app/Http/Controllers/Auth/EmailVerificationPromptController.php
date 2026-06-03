<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\EmailVerificationCooldown;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended(route('dashboard', absolute: false))
                    : Inertia::render('Auth/VerifyEmail', [
                        'status' => session('status'),
                        'email' => $request->user()->email,
                        'cooldownSeconds' => max(
                            (int) session('cooldown_seconds', 0),
                            EmailVerificationCooldown::remainingSeconds($request->user()),
                        ),
                    ]);
    }
}
