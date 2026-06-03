<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IuranWajib extends Model
{
    use HasFactory;

    protected $table = 'iuran_wajib';

    protected $primaryKey = 'id_iuran_wajib';

    protected $fillable = [
        'nama_iuran',
        'nominal_default',
        'periode',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'nominal_default' => 'decimal:2',
        ];
    }

    public function tagihanWarga(): HasMany
    {
        return $this->hasMany(TagihanWarga::class, 'id_iuran_wajib', 'id_iuran_wajib');
    }
}