<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\EmailVerificationCooldown;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'name' => trim($request->string('name')->toString()),
            'username' => trim($request->string('username')->toString()),
            'email' => Str::lower(trim($request->string('email')->toString())),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:100', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $assignedRole = User::query()
            ->where('role', 'Ketua_RT')
            ->where('is_approved', true)
            ->exists()
            ? 'Bendahara'
            : 'Ketua_RT';

        $user = User::create([
            'nama_lengkap' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'role' => $assignedRole,
            'password' => $validated['password'],
            'is_approved' => false,
            'is_active' => true,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        event(new Registered($user));

        Auth::login($user);
        $cooldownSeconds = EmailVerificationCooldown::startOrAdvance($user);

        return redirect(route('verification.notice'))
            ->with('status', 'verification-link-sent-initial')
            ->with('cooldown_seconds', $cooldownSeconds);
    }
}
