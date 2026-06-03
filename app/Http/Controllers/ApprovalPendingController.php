<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalPendingController extends Controller
{
    public function __invoke(Request $request): RedirectResponse|Response
    {
        $user = $request->user();

        if ($user?->isApproved()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/ApprovalPending', [
            'userInfo' => [
                'name' => $user?->name,
                'email' => $user?->email,
                'role' => $user?->role,
                'email_verified_at' => optional($user?->email_verified_at)?->format('d M Y H:i'),
            ],
        ]);
    }
}
