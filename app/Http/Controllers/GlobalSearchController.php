<?php

namespace App\Http\Controllers;

use App\Models\TagihanWarga;
use App\Models\TransaksiKas;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GlobalSearchController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $query = trim($request->string('q')->toString());
        $likeQuery = '%'.$query.'%';
        $isKetuaRt = $request->user()?->role === 'Ketua_RT';

        $wargaResults = [];
        $tagihanResults = [];
        $transaksiResults = [];
        $akunResults = [];

        if ($query !== '') {
            $wargaResults = Warga::query()
                ->where(function ($builder) use ($likeQuery) {
                    $builder
                        ->where('nama', 'like', $likeQuery)
                        ->orWhere('no_rumah', 'like', $likeQuery)
                        ->orWhere('no_telepon', 'like', $likeQuery)
                        ->orWhere('status_hunian', 'like', $likeQuery);
                })
                ->orderBy('nama')
                ->limit(5)
                ->get()
                ->map(fn (Warga $warga) => [
                    'id' => $warga->id_warga,
                    'title' => $warga->nama,
                    'subtitle' => implode(' • ', array_filter([
                        $warga->no_rumah ? 'Rumah '.$warga->no_rumah : null,
                        $warga->status_hunian,
                        $warga->no_telepon,
                    ])),
                    'href' => route('data-warga', ['search' => $warga->nama]),
                ])
                ->values()
                ->all();

            $tagihanResults = TagihanWarga::query()
                ->with(['warga', 'iuranWajib'])
                ->where(function ($builder) use ($likeQuery) {
                    $builder
                        ->where('status_bayar', 'like', $likeQuery)
                        ->orWhereHas('warga', function ($wargaQuery) use ($likeQuery) {
                            $wargaQuery
                                ->where('nama', 'like', $likeQuery)
                                ->orWhere('no_rumah', 'like', $likeQuery);
                        })
                        ->orWhereHas('iuranWajib', function ($iuranQuery) use ($likeQuery) {
                            $iuranQuery->where('nama_iuran', 'like', $likeQuery);
                        });
                })
                ->orderByDesc('tahun')
                ->orderByDesc('bulan')
                ->limit(5)
                ->get()
                ->map(fn (TagihanWarga $tagihan) => [
                    'id' => $tagihan->id_tagihan,
                    'title' => ($tagihan->warga?->nama ?? 'Warga').' - '.($tagihan->iuranWajib?->nama_iuran ?? 'Iuran'),
                    'subtitle' => implode(' • ', array_filter([
                        $this->formatPeriod((int) $tagihan->bulan, (int) $tagihan->tahun),
                        'Status: '.$tagihan->status_bayar,
                        $this->formatCurrency((float) $tagihan->nominal),
                    ])),
                    'href' => route('tagihan-warga', [
                        'search' => $tagihan->warga?->nama,
                        'bulan' => $tagihan->bulan,
                        'tahun' => $tagihan->tahun,
                    ]),
                ])
                ->values()
                ->all();

            $transaksiResults = TransaksiKas::query()
                ->with('kategori')
                ->where(function ($builder) use ($likeQuery) {
                    $builder
                        ->where('keterangan', 'like', $likeQuery)
                        ->orWhereHas('kategori', function ($kategoriQuery) use ($likeQuery) {
                            $kategoriQuery->where('nama_kategori', 'like', $likeQuery);
                        })
                        ->orWhere('jenis_transaksi', 'like', $likeQuery);
                })
                ->orderByDesc('tgl_transaksi')
                ->orderByDesc('id_transaksi')
                ->limit(5)
                ->get()
                ->map(fn (TransaksiKas $transaksi) => [
                    'id' => $transaksi->id_transaksi,
                    'title' => ($transaksi->kategori?->nama_kategori ?? 'Kategori').' - '.$this->formatCurrency((float) $transaksi->jumlah),
                    'subtitle' => implode(' • ', array_filter([
                        optional($transaksi->tgl_transaksi)?->format('d M Y'),
                        $transaksi->jenis_transaksi,
                        $transaksi->keterangan,
                    ])),
                    'href' => route('transaksi-kas', [
                        'search' => $transaksi->keterangan ?: $transaksi->kategori?->nama_kategori,
                    ]),
                ])
                ->values()
                ->all();

            if ($isKetuaRt) {
                $akunResults = User::query()
                    ->where(function ($builder) use ($likeQuery) {
                        $builder
                            ->where('nama_lengkap', 'like', $likeQuery)
                            ->orWhere('username', 'like', $likeQuery)
                            ->orWhere('email', 'like', $likeQuery)
                            ->orWhere('role', 'like', $likeQuery)
                            ->orWhere('no_telepon', 'like', $likeQuery);
                    })
                    ->orderByDesc('created_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (User $user) => [
                        'id' => $user->id_user,
                        'title' => $user->nama_lengkap,
                        'subtitle' => implode(' • ', array_filter([
                            $user->username,
                            $user->email,
                            $user->role === 'Ketua_RT' ? 'Ketua RT' : 'Bendahara',
                        ])),
                        'href' => route('approval.index', ['search' => $user->email]),
                    ])
                    ->values()
                    ->all();
            }
        }

        return Inertia::render('GlobalSearch', [
            'globalSearch' => [
                'query' => $query,
            ],
            'results' => [
                'warga' => [
                    'label' => 'Data Warga',
                    'items' => $wargaResults,
                    'href' => route('data-warga', ['search' => $query ?: null]),
                ],
                'tagihan' => [
                    'label' => 'Tagihan Warga',
                    'items' => $tagihanResults,
                    'href' => route('tagihan-warga', ['search' => $query ?: null]),
                ],
                'transaksi' => [
                    'label' => 'Transaksi Kas',
                    'items' => $transaksiResults,
                    'href' => route('transaksi-kas', ['search' => $query ?: null]),
                ],
                'akun' => [
                    'label' => 'Kelola Akun',
                    'items' => $akunResults,
                    'href' => $isKetuaRt ? route('approval.index', ['search' => $query ?: null]) : null,
                ],
            ],
            'meta' => [
                'can_search_accounts' => $isKetuaRt,
                'total_results' => count($wargaResults) + count($tagihanResults) + count($transaksiResults) + count($akunResults),
            ],
        ]);
    }

    private function formatCurrency(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }

    private function formatPeriod(int $month, int $year): string
    {
        $monthNames = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        ];

        return ($monthNames[$month] ?? '-').' '.$year;
    }
}
