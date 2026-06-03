<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'id_user';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'no_telepon',
        'password',
        'nama_lengkap',
        'role',
        'is_approved',
        'is_active',
        'approved_at',
        'approved_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Accessors appended to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'name',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_approved' => 'boolean',
            'is_active' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->nama_lengkap,
        );
    }

    public function isApproved(): bool
    {
        return (bool) $this->is_approved;
    }

    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }

    public function shouldBootstrapApproval(): bool
    {
        if ($this->role !== 'Ketua_RT' || ! $this->hasVerifiedEmail()) {
            return false;
        }

        return ! static::query()
            ->where('role', 'Ketua_RT')
            ->where('is_approved', true)
            ->where('id_user', '!=', $this->getKey())
            ->exists();
    }

    public function approve(?self $approver = null): void
    {
        $this->forceFill([
            'is_approved' => true,
            'is_active' => true,
            'approved_at' => now(),
            'approved_by' => $approver?->getKey(),
        ])->save();
    }

    public function activate(): void
    {
        $this->forceFill([
            'is_active' => true,
        ])->save();
    }

    public function deactivate(): void
    {
        $this->forceFill([
            'is_active' => false,
        ])->save();
    }
}
