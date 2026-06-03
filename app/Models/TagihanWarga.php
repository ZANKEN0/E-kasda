<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TagihanWarga extends Model
{
    use HasFactory;

    protected $table = 'tagihan_warga';

    protected $primaryKey = 'id_tagihan';

    protected $fillable = [
        'id_warga',
        'id_iuran_wajib',
        'bulan',
        'tahun',
        'status_bayar',
        'nominal',
        'tanggal_jatuh_tempo',
        'tanggal_lunas',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'nominal' => 'decimal:2',
            'tanggal_jatuh_tempo' => 'date',
            'tanggal_lunas' => 'datetime',
        ];
    }

    public function warga(): BelongsTo
    {
        return $this->belongsTo(Warga::class, 'id_warga', 'id_warga');
    }

    public function iuranWajib(): BelongsTo
    {
        return $this->belongsTo(IuranWajib::class, 'id_iuran_wajib', 'id_iuran_wajib');
    }
}