<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $user = User::query()
            ->where($this->loginField(), $this->normalizedLogin())
            ->first();

        if (! $user) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => $this->loginField() === 'email'
                    ? 'Email belum terdaftar di sistem.'
                    : 'Username belum terdaftar di sistem.',
            ]);
        }

        if (! Hash::check($this->string('password')->toString(), $user->password)) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'password' => 'Kata sandi yang Anda masukkan salah.',
            ]);
        }

        if (! $user->isActive()) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => 'Akun Anda sedang dinonaktifkan. Hubungi Ketua RT untuk mengaktifkannya kembali.',
            ]);
        }

        Auth::login($user, $this->boolean('remember'));
        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->normalizedLogin()).'|'.$this->ip());
    }

    private function loginField(): string
    {
        return filter_var($this->trimmedLogin(), FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
    }

    private function normalizedLogin(): string
    {
        $login = $this->trimmedLogin();

        return $this->loginField() === 'email'
            ? Str::lower($login)
            : $login;
    }

    private function trimmedLogin(): string
    {
        return trim($this->string('login')->toString());
    }
}
