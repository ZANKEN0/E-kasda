<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warga extends Model
{
    use HasFactory;

    protected $table = 'warga';

    protected $primaryKey = 'id_warga';

    protected $fillable = [
        'nama',
        'no_rumah',
        'no_telepon',
        'status_hunian',
    ];

    public function tagihanWarga(): HasMany
    {
        return $this->hasMany(TagihanWarga::class, 'id_warga', 'id_warga');
    }
}