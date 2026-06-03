<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\StreamsCsv;
use App\Http\Requests\StoreTagihanWargaRequest;
use App\Http\Requests\UpdateTagihanWargaRequest;
use App\Models\IuranWajib;
use App\Models\TagihanWarga;
use App\Models\Warga;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TagihanWargaController extends Controller
{
    use StreamsCsv;

    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim($request->string('search')->toString()),
            'bulan' => trim($request->string('bulan')->toString()),
            'tahun' => trim($request->string('tahun')->toString()),
            'status' => trim($request->string('status')->toString()),
        ];

        $query = $this->buildFilteredQuery($filters, withStatus: true);
        $statsQuery = $this->buildFilteredQuery($filters, withStatus: false);

        $paginator = $query
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->orderByDesc('id_tagihan')
            ->paginate(10)
            ->withQueryString();

        $items = $paginator->getCollection()->map(function (TagihanWarga $tagihan) {
            return [
                'id_tagihan' => $tagihan->id_tagihan,
                'id_warga' => $tagihan->id_warga,
                'id_iuran_wajib' => $tagihan->id_iuran_wajib,
                'nama_warga' => $tagihan->warga?->nama ?? '-',
                'no_rumah' => $tagihan->warga?->no_rumah ?? '-',
                'nama_iuran' => $tagihan->iuranWajib?->nama_iuran ?? '-',
                'bulan' => (int) $tagihan->bulan,
                'tahun' => (int) $tagihan->tahun,
                'periode_label' => $this->periodLabel((int) $tagihan->bulan, (int) $tagihan->tahun),
                'nominal' => (float) $tagihan->nominal,
                'nominal_formatted' => $this->formatCurrency((float) $tagihan->nominal),
                'status_bayar' => $tagihan->status_bayar,
                'tanggal_jatuh_tempo' => optional($tagihan->tanggal_jatuh_tempo)?->format('Y-m-d'),
                'catatan' => $tagihan->catatan,
            ];
        })->values()->all();

        $allTagihan = $statsQuery->get(['nominal', 'status_bayar']);
        $stats = [
            'period_label' => $this->statsPeriodLabel($filters),
            'total_tagihan' => $this->formatCurrency((float) $allTagihan->sum('nominal')),
            'belum_lunas' => $this->formatCurrency((float) $allTagihan->where('status_bayar', 'Belum Lunas')->sum('nominal')),
            'lunas' => $this->formatCurrency((float) $allTagihan->where('status_bayar', 'Lunas')->sum('nominal')),
        ];

        $wargaOptions = Warga::query()
            ->orderBy('nama')
            ->get(['id_warga', 'nama', 'no_rumah'])
            ->map(fn (Warga $warga) => [
                'id_warga' => $warga->id_warga,
                'label' => $warga->nama.($warga->no_rumah ? ' - '.$warga->no_rumah : ''),
            ])
            ->values()
            ->all();

        $iuranOptions = IuranWajib::query()
            ->orderBy('nama_iuran')
            ->get(['id_iuran_wajib', 'nama_iuran', 'nominal_default', 'periode'])
            ->map(fn (IuranWajib $iuran) => [
                'id_iuran_wajib' => $iuran->id_iuran_wajib,
                'nama_iuran' => $iuran->nama_iuran,
                'nominal_default' => (float) $iuran->nominal_default,
                'nominal_default_formatted' => $this->formatCurrency((float) $iuran->nominal_default),
                'periode' => $iuran->periode,
            ])
            ->values()
            ->all();

        return Inertia::render('TagihanWarga', [
            'rows' => $items,
            'stats' => $stats,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
            'filters' => $filters,
            'wargaOptions' => $wargaOptions,
            'iuranOptions' => $iuranOptions,
            'monthOptions' => $this->monthOptions(),
            'yearOptions' => $this->yearOptions(),
        ]);
    }

    public function store(StoreTagihanWargaRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $targetScope = $validated['target_scope'] ?? 'single';

        unset($validated['target_scope']);

        $validated['status_bayar'] = 'Belum Lunas';
        $validated['tanggal_lunas'] = null;

        if ($targetScope === 'all') {
            return $this->storeForAllWarga($validated);
        }

        try {
            TagihanWarga::create($validated);
        } catch (QueryException $exception) {
            if ((int) $exception->getCode() === 23000) {
                return redirect()
                    ->route('tagihan-warga')
                    ->with('error', 'Tagihan untuk warga, iuran, bulan, dan tahun tersebut sudah ada.');
            }

            throw $exception;
        }

        return redirect()
            ->route('tagihan-warga')
            ->with('success', 'Tagihan warga berhasil dibuat.');
    }

    public function update(UpdateTagihanWargaRequest $request, TagihanWarga $tagihanWarga): RedirectResponse
    {
        if ($tagihanWarga->status_bayar === 'Lunas') {
            return redirect()
                ->route('tagihan-warga')
                ->with('error', 'Tagihan yang sudah lunas hanya dapat berubah melalui riwayat pembayaran, bukan edit manual.');
        }

        $validated = $request->validated();
        $validated['status_bayar'] = 'Belum Lunas';
        $validated['tanggal_lunas'] = null;

        try {
            $tagihanWarga->update($validated);
        } catch (QueryException $exception) {
            if ((int) $exception->getCode() === 23000) {
                return redirect()
                    ->route('tagihan-warga')
                    ->with('error', 'Tagihan untuk warga, iuran, bulan, dan tahun tersebut sudah ada.');
            }

            throw $exception;
        }

        return redirect()
            ->route('tagihan-warga')
            ->with('success', 'Tagihan warga berhasil diperbarui.');
    }

    public function destroy(TagihanWarga $tagihanWarga): RedirectResponse
    {
        if ($tagihanWarga->status_bayar === 'Lunas') {
            return redirect()
                ->route('tagihan-warga')
                ->with('error', 'Tagihan yang sudah lunas tidak dapat dihapus dari modul ini.');
        }

        $tagihanWarga->delete();

        return redirect()
            ->route('tagihan-warga')
            ->with('success', 'Tagihan warga berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $filters = [
            'search' => trim($request->string('search')->toString()),
            'bulan' => trim($request->string('bulan')->toString()),
            'tahun' => trim($request->string('tahun')->toString()),
            'status' => trim($request->string('status')->toString()),
        ];

        $query = $this->buildFilteredQuery($filters, withStatus: true);

        $rows = $query
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->orderBy('id_warga')
            ->get()
            ->map(function (TagihanWarga $tagihan) {
                return [
                    $tagihan->warga?->nama ?? '-',
                    $tagihan->warga?->no_rumah ?? '-',
                    $tagihan->iuranWajib?->nama_iuran ?? '-',
                    $tagihan->bulan,
                    $tagihan->tahun,
                    $this->periodLabel((int) $tagihan->bulan, (int) $tagihan->tahun),
                    (float) $tagihan->nominal,
                    $tagihan->status_bayar,
                    optional($tagihan->tanggal_jatuh_tempo)?->format('Y-m-d'),
                    $tagihan->catatan,
                ];
            });

        return $this->streamCsv(
            'tagihan-warga-'.now()->format('Y-m-d').'.csv',
            [
                'Nama Warga',
                'No Rumah',
                'Jenis Iuran',
                'Bulan',
                'Tahun',
                'Periode',
                'Nominal',
                'Status Bayar',
                'Tanggal Jatuh Tempo',
                'Catatan',
            ],
            $rows,
        );
    }

    /**
     * @param array<string, mixed> $validated
     */
    private function storeForAllWarga(array $validated): RedirectResponse
    {
        $now = now();
        $warga = Warga::query()
            ->orderBy('nama')
            ->get(['id_warga']);

        if ($warga->isEmpty()) {
            return redirect()
                ->route('tagihan-warga')
                ->with('error', 'Belum ada data warga yang bisa dibuatkan tagihan massal.');
        }

        $rowsToCreate = $warga
            ->map(function (Warga $item) use ($validated, $now) {
                return [
                    ...$validated,
                    'id_warga' => $item->id_warga,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            })
            ->values()
            ->all();

        $createdCount = DB::transaction(fn (): int => TagihanWarga::query()->insertOrIgnore($rowsToCreate));
        $skippedCount = count($rowsToCreate) - $createdCount;

        if ($createdCount === 0) {
            return redirect()
                ->route('tagihan-warga')
                ->with('error', 'Semua warga sudah memiliki tagihan untuk iuran dan periode tersebut.');
        }

        $message = "Tagihan massal berhasil dibuat untuk {$createdCount} warga.";

        if ($skippedCount > 0) {
            $message .= " {$skippedCount} warga dilewati karena tagihan untuk periode ini sudah ada.";
        }

        return redirect()
            ->route('tagihan-warga')
            ->with('success', $message);
    }

    private function formatCurrency(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }

    /**
     * @param array<string, string> $filters
     */
    private function buildFilteredQuery(array $filters, bool $withStatus): \Illuminate\Database\Eloquent\Builder
    {
        $query = TagihanWarga::query()->with(['warga', 'iuranWajib']);

        if ($filters['search'] !== '') {
            $search = '%'.$filters['search'].'%';

            $query->where(function ($builder) use ($search) {
                $builder
                    ->whereHas('warga', function ($wargaQuery) use ($search) {
                        $wargaQuery
                            ->where('nama', 'like', $search)
                            ->orWhere('no_rumah', 'like', $search);
                    })
                    ->orWhereHas('iuranWajib', function ($iuranQuery) use ($search) {
                        $iuranQuery->where('nama_iuran', 'like', $search);
                    });
            });
        }

        if ($filters['bulan'] !== '') {
            $query->where('bulan', (int) $filters['bulan']);
        }

        if ($filters['tahun'] !== '') {
            $query->where('tahun', (int) $filters['tahun']);
        }

        if ($withStatus && $filters['status'] !== '') {
            $query->where('status_bayar', $filters['status']);
        }

        return $query;
    }

    /**
     * @param array<string, string> $filters
     */
    private function statsPeriodLabel(array $filters): string
    {
        $months = $this->monthOptions();
        $month = $filters['bulan'] !== '' ? (int) $filters['bulan'] : null;
        $year = $filters['tahun'] !== '' ? (int) $filters['tahun'] : null;

        if ($month && $year) {
            return 'Periode '.($months[$month] ?? 'Bulan').' '.$year;
        }

        if ($year) {
            return 'Tahun '.$year;
        }

        if ($month) {
            return 'Semua tahun untuk '.($months[$month] ?? 'bulan terpilih');
        }

        return 'Semua periode';
    }

    private function periodLabel(int $month, int $year): string
    {
        $months = $this->monthOptions();

        return ($months[$month] ?? 'Bulan').' '.$year;
    }

    /**
     * @return array<int, string>
     */
    private function monthOptions(): array
    {
        return [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];
    }

    /**
     * @return array<int, int>
     */
    private function yearOptions(): array
    {
        $currentYear = (int) now()->format('Y');

        return range($currentYear - 2, $currentYear + 2);
    }
}
