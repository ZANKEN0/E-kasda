<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiKas extends Model
{
    use HasFactory;

    protected $table = 'transaksi_kas';

    protected $primaryKey = 'id_transaksi';

    protected $fillable = [
        'id_kategori',
        'id_user',
        'id_tagihan',
        'id_pembayaran',
        'tgl_transaksi',
        'jenis_transaksi',
        'jumlah',
        'keterangan',
        'bukti_pembayaran',
    ];

    protected function casts(): array
    {
        return [
            'tgl_transaksi' => 'datetime',
            'jumlah' => 'decimal:2',
        ];
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class, 'id_kategori', 'id_kategori');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}