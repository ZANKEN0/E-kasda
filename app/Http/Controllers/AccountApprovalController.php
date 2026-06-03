<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AccountApprovalController extends Controller
{
    private const UNVERIFIED_CLEANUP_DAYS = 4;

    public function index(Request $request): Response
    {
        $search = trim($request->string('search')->toString());

        $staleUnverifiedAccounts = $this->buildStaleUnverifiedAccountsQuery($search)
            ->orderBy('created_at')
            ->get()
            ->map(fn (User $user) => [
                'id_user' => $user->id_user,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'no_telepon' => $user->no_telepon,
                'created_at' => optional($user->created_at)?->format('d M Y H:i'),
            ])
            ->values()
            ->all();

        $pendingAccounts = User::query()
            ->whereNotNull('email_verified_at')
            ->where('is_approved', false)
            ->when($search !== '', fn (Builder $query) => $this->applyAccountSearch($query, $search))
            ->orderBy('created_at')
            ->get()
            ->map(fn (User $user) => [
                'id_user' => $user->id_user,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'no_telepon' => $user->no_telepon,
                'role' => $user->role,
                'created_at' => optional($user->created_at)?->format('d M Y H:i'),
                'email_verified_at' => optional($user->email_verified_at)?->format('d M Y H:i'),
            ])
            ->values()
            ->all();

        $managedAccounts = User::query()
            ->when($search !== '', fn (Builder $query) => $this->applyAccountSearch($query, $search))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $user) => [
                'id_user' => $user->id_user,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'no_telepon' => $user->no_telepon,
                'role' => $user->role,
                'is_approved' => $user->isApproved(),
                'is_active' => $user->isActive(),
                'email_verified_at' => optional($user->email_verified_at)?->format('d M Y H:i'),
                'created_at' => optional($user->created_at)?->format('d M Y H:i'),
                'approved_at' => optional($user->approved_at)?->format('d M Y H:i'),
                'is_current_user' => request()->user()?->getKey() === $user->getKey(),
            ])
            ->values()
            ->all();

        return Inertia::render('Approval/Index', [
            'stats' => [
                'total' => User::query()->count(),
                'pending' => count($pendingAccounts),
                'approved' => User::query()->where('is_approved', true)->count(),
                'active' => User::query()->where('is_active', true)->count(),
                'inactive' => User::query()->where('is_active', false)->count(),
                'ketua_rt' => User::query()->where('role', 'Ketua_RT')->count(),
                'bendahara' => User::query()->where('role', 'Bendahara')->count(),
                'stale_unverified' => count($staleUnverifiedAccounts),
            ],
            'pendingAccounts' => $pendingAccounts,
            'managedAccounts' => $managedAccounts,
            'staleUnverifiedAccounts' => $staleUnverifiedAccounts,
            'cleanupPolicy' => [
                'days' => self::UNVERIFIED_CLEANUP_DAYS,
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:100'],
            'username' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('users', 'username')],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'no_telepon' => ['nullable', 'string', 'max:20'],
            'role' => ['required', Rule::in(['Ketua_RT', 'Bendahara'])],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        User::query()->create([
            'nama_lengkap' => $validated['nama_lengkap'],
            'username' => $validated['username'],
            'email' => Str::lower($validated['email']),
            'no_telepon' => $validated['no_telepon'] ?: null,
            'role' => $validated['role'],
            'password' => $validated['password'],
            'email_verified_at' => now(),
            'is_approved' => true,
            'is_active' => true,
            'approved_at' => now(),
            'approved_by' => $request->user()?->getKey(),
        ]);

        return redirect()
            ->route('approval.index')
            ->with('success', 'Akun baru berhasil dibuat dan langsung aktif. User bisa langsung masuk sesuai role yang diberikan.');
    }

    public function approve(Request $request, User $user): RedirectResponse
    {
        if ($user->isApproved()) {
            return redirect()
                ->route('approval.index')
                ->with('error', 'Akun ini sudah disetujui sebelumnya.');
        }

        if (! $user->hasVerifiedEmail()) {
            return redirect()
                ->route('approval.index')
                ->with('error', 'Akun belum memverifikasi email sehingga belum bisa disetujui.');
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['Ketua_RT', 'Bendahara'])],
        ]);

        $user->forceFill([
            'role' => $validated['role'],
        ])->save();

        $user->approve(request()->user());

        return redirect()
            ->route('approval.index')
            ->with('success', 'Akun berhasil disetujui dan role final sudah ditetapkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:100'],
            'username' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique('users', 'username')->ignore($user->getKey(), 'id_user'),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->getKey(), 'id_user'),
            ],
            'no_telepon' => ['nullable', 'string', 'max:20'],
            'role' => ['required', Rule::in(['Ketua_RT', 'Bendahara'])],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        if (
            $user->role === 'Ketua_RT'
            && $validated['role'] !== 'Ketua_RT'
            && $user->isApproved()
            && User::query()
                ->where('role', 'Ketua_RT')
                ->where('is_approved', true)
                ->count() <= 1
        ) {
            return redirect()
                ->route('approval.index')
                ->with('error', 'Akun Ketua RT terakhir tidak boleh diubah menjadi Bendahara.');
        }

        $user->fill([
            'nama_lengkap' => $validated['nama_lengkap'],
            'username' => $validated['username'],
            'email' => Str::lower($validated['email']),
            'no_telepon' => $validated['no_telepon'] ?: null,
            'role' => $validated['role'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if (! empty($validated['password'])) {
            $user->password = $validated['password'];
        }

        $user->save();

        return redirect()
            ->route('approval.index')
            ->with('success', 'Data akun berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        if ($request->user()?->getKey() === $user->getKey()) {
            return redirect()
                ->route('approval.index')
                ->with('error', 'Akun yang sedang dipakai login tidak bisa dihapus dari halaman ini.');
        }

        if (
            $user->role === 'Ketua_RT'
            && $user->isApproved()
            && User::query()
                ->where('role', 'Ketua_RT')
                ->where('is_approved', true)
                ->count() <= 1
        ) {
            return redirect()
                ->route('approval.index')
                ->with('error', 'Akun Ketua RT terakhir tidak boleh dihapus.');
        }

        $message = $user->isApproved()
            ? 'Akun berhasil dihapus.'
            : 'Akun pending berhasil ditolak dan dihapus.';

        $user->delete();

        return redirect()
            ->route('approval.index')
            ->with('success', $message);
    }

    public function toggleActive(User $user): RedirectResponse
    {
        if (request()->user()?->getKey() === $user->getKey()) {
            return redirect()
                ->route('approval.index')
                ->with('error', 'Akun yang sedang dipakai login tidak bisa dinonaktifkan dari halaman ini.');
        }

        if (
            $user->role === 'Ketua_RT'
            && $user->isApproved()
            && $user->isActive()
            && User::query()
                ->where('role', 'Ketua_RT')
                ->where('is_approved', true)
                ->where('is_active', true)
                ->count() <= 1
        ) {
            return redirect()
                ->route('approval.index')
                ->with('error', 'Ketua RT aktif terakhir tidak boleh dinonaktifkan.');
        }

        if ($user->isActive()) {
            $user->deactivate();

            return redirect()
                ->route('approval.index')
                ->with('success', 'Akun berhasil dinonaktifkan. User tidak bisa login sampai diaktifkan kembali.');
        }

        $user->activate();

        return redirect()
            ->route('approval.index')
            ->with('success', 'Akun berhasil diaktifkan kembali.');
    }

    public function cleanupUnverified(): RedirectResponse
    {
        $query = $this->buildStaleUnverifiedAccountsQuery();

        $deletedCount = (clone $query)->count();

        if ($deletedCount === 0) {
            return redirect()
                ->route('approval.index')
                ->with('error', 'Tidak ada akun belum verifikasi yang melewati batas 4 hari.');
        }

        $query->delete();

        return redirect()
            ->route('approval.index')
            ->with('success', "Berhasil membersihkan {$deletedCount} akun yang belum verifikasi lebih dari 4 hari.");
    }

    private function buildStaleUnverifiedAccountsQuery(string $search = ''): Builder
    {
        return User::query()
            ->where('is_approved', false)
            ->whereNull('approved_at')
            ->whereNull('email_verified_at')
            ->where('created_at', '<=', now()->subDays(self::UNVERIFIED_CLEANUP_DAYS))
            ->when($search !== '', fn (Builder $query) => $this->applyAccountSearch($query, $search));
    }

    private function applyAccountSearch(Builder $query, string $search): Builder
    {
        $likeSearch = '%'.Str::lower($search).'%';

        return $query->where(function (Builder $builder) use ($likeSearch): void {
            $builder
                ->whereRaw('LOWER(nama_lengkap) like ?', [$likeSearch])
                ->orWhereRaw('LOWER(username) like ?', [$likeSearch])
                ->orWhereRaw('LOWER(email) like ?', [$likeSearch])
                ->orWhereRaw('LOWER(role) like ?', [$likeSearch])
                ->orWhereRaw('LOWER(COALESCE(no_telepon, "")) like ?', [$likeSearch]);
        });
    }
}
