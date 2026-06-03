<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PembayaranIuran extends Model
{
    use HasFactory;

    protected $table = 'pembayaran_iuran';

    protected $primaryKey = 'id_pembayaran';

    protected $fillable = [
        'id_tagihan',
        'id_user',
        'tanggal_bayar',
        'jumlah_bayar',
        'metode_bayar',
        'bukti_pembayaran',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_bayar' => 'datetime',
            'jumlah_bayar' => 'decimal:2',
        ];
    }

    public function tagihanWarga(): BelongsTo
    {
        return $this->belongsTo(TagihanWarga::class, 'id_tagihan', 'id_tagihan');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}