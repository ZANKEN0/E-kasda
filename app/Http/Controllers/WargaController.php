<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\StreamsCsv;
use App\Http\Requests\ImportWargaRequest;
use App\Http\Requests\StoreWargaRequest;
use App\Http\Requests\UpdateWargaRequest;
use App\Models\Warga;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WargaController extends Controller
{
    use StreamsCsv;

    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim($request->string('search')->toString()),
            'blok' => trim($request->string('blok')->toString()),
            'status_iuran' => trim($request->string('status_iuran')->toString()),
        ];

        $query = Warga::query();

        if ($filters['search'] !== '') {
            $search = '%'.$filters['search'].'%';

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('nama', 'like', $search)
                    ->orWhere('no_rumah', 'like', $search)
                    ->orWhere('no_telepon', 'like', $search);
            });
        }

        if ($filters['blok'] !== '') {
            $query->where('no_rumah', 'like', $filters['blok'].'%');
        }

        $query = $this->applyIuranFilter($query, $filters['status_iuran']);

        $paginator = $query
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString();

        $statusMap = $this->buildStatusMap(
            Warga::pluck('id_warga')->all()
        );

        $residents = $this->transformResidents($paginator, $statusMap);
        $blokOptions = $this->extractBlokOptions();

        return Inertia::render('DataWarga', [
            'stats' => $this->buildStats($statusMap, $blokOptions),
            'residents' => $residents['items'],
            'pagination' => $residents['pagination'],
            'filters' => $filters,
            'blokOptions' => $blokOptions->all(),
        ]);
    }

    public function store(StoreWargaRequest $request): RedirectResponse
    {
        Warga::create($request->validated());

        return redirect()
            ->route('data-warga')
            ->with('success', 'Data warga berhasil ditambahkan.');
    }

    public function update(UpdateWargaRequest $request, Warga $warga): RedirectResponse
    {
        $warga->update($request->validated());

        return redirect()
            ->route('data-warga')
            ->with('success', 'Data warga berhasil diperbarui.');
    }

    public function destroy(Warga $warga): RedirectResponse
    {
        if ($warga->tagihanWarga()->exists()) {
            return redirect()
                ->route('data-warga')
                ->with('error', 'Warga yang sudah memiliki tagihan tidak dapat dihapus.');
        }

        $warga->delete();

        return redirect()
            ->route('data-warga')
            ->with('success', 'Data warga berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $filters = [
            'search' => trim($request->string('search')->toString()),
            'blok' => trim($request->string('blok')->toString()),
            'status_iuran' => trim($request->string('status_iuran')->toString()),
        ];

        $query = Warga::query();

        if ($filters['search'] !== '') {
            $search = '%'.$filters['search'].'%';

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('nama', 'like', $search)
                    ->orWhere('no_rumah', 'like', $search)
                    ->orWhere('no_telepon', 'like', $search);
            });
        }

        if ($filters['blok'] !== '') {
            $query->where('no_rumah', 'like', $filters['blok'].'%');
        }

        $wargaList = $this->applyIuranFilter($query, $filters['status_iuran'])
            ->orderBy('nama')
            ->get();

        $statusMap = $this->buildStatusMap($wargaList->pluck('id_warga')->all());

        $rows = $wargaList->map(function (Warga $warga) use ($statusMap) {
            $status = $statusMap[$warga->id_warga]['status'] ?? 'Belum Ada Tagihan';

            return [
                $warga->nama,
                $warga->no_rumah,
                $warga->no_telepon,
                $warga->status_hunian,
                $status,
            ];
        });

        return $this->streamCsv(
            'data-warga-'.now()->format('Y-m-d').'.csv',
            ['Nama', 'No Rumah', 'No Telepon', 'Status Hunian', 'Status Iuran'],
            $rows,
        );
    }

    public function template()
    {
        return $this->streamCsv(
            'template-import-warga.csv',
            ['nama', 'no_rumah', 'no_telepon', 'status_hunian'],
            [
                ['Budi Santoso', 'Blok A / No. 12', '081234567890', 'Tetap'],
                ['Siti Rahma', 'Blok B / No. 03', '', 'Kontrak'],
            ],
            [
                ['Petunjuk'],
                ['1. Gunakan header persis seperti template ini.'],
                ['2. Isi status_hunian dengan Tetap atau Kontrak.'],
                ['3. Simpan file dari Excel sebagai CSV UTF-8 sebelum diimpor.'],
            ],
        );
    }

    public function import(ImportWargaRequest $request): RedirectResponse
    {
        $rows = collect($request->validated('rows'));
        $seenKeys = [];
        $existingKeys = Warga::query()
            ->select(['nama', 'no_rumah'])
            ->get()
            ->mapWithKeys(fn (Warga $warga) => [
                $this->makeWargaDuplicateKey($warga->nama, $warga->no_rumah) => true,
            ])
            ->all();

        $rowsToInsert = $rows
            ->filter(function (array $row) use (&$seenKeys, $existingKeys): bool {
                $duplicateKey = $this->makeWargaDuplicateKey($row['nama'], $row['no_rumah']);

                if (isset($existingKeys[$duplicateKey]) || isset($seenKeys[$duplicateKey])) {
                    return false;
                }

                $seenKeys[$duplicateKey] = true;

                return true;
            })
            ->values();

        $importedCount = $rowsToInsert->count();
        $skippedCount = $rows->count() - $importedCount;

        if ($importedCount === 0) {
            return redirect()
                ->route('data-warga')
                ->with('error', 'Tidak ada data warga baru yang diimpor. Semua baris terdeteksi sebagai duplikat.');
        }

        DB::transaction(function () use ($rowsToInsert): void {
            $rowsToInsert->each(function (array $row): void {
                Warga::create($row);
            });
        });

        $message = "{$importedCount} data warga berhasil diimpor.";

        if ($skippedCount > 0) {
            $message .= " {$skippedCount} baris dilewati karena terdeteksi duplikat nama dan nomor rumah.";
        }

        return redirect()
            ->route('data-warga')
            ->with('success', $message);
    }

    private function makeWargaDuplicateKey(string $nama, string $noRumah): string
    {
        return Str::lower(trim(preg_replace('/\s+/', ' ', $nama) ?? $nama))
            .'|'.
            Str::lower(trim(preg_replace('/\s+/', ' ', $noRumah) ?? $noRumah));
    }

    private function applyIuranFilter($query, string $statusIuran)
    {
        $summaryQuery = DB::table('tagihan_warga')
            ->selectRaw("id_warga, SUM(CASE WHEN status_bayar = 'Belum Lunas' THEN 1 ELSE 0 END) AS belum_lunas_count, COUNT(*) AS total_tagihan")
            ->groupBy('id_warga');

        if ($statusIuran === 'Lunas') {
            return $query->whereIn('id_warga', function ($subQuery) use ($summaryQuery) {
                $subQuery
                    ->fromSub($summaryQuery, 'tagihan_summary')
                    ->select('id_warga')
                    ->where('total_tagihan', '>', 0)
                    ->where('belum_lunas_count', 0);
            });
        }

        if ($statusIuran === 'Belum Lunas') {
            return $query->whereIn('id_warga', function ($subQuery) use ($summaryQuery) {
                $subQuery
                    ->fromSub($summaryQuery, 'tagihan_summary')
                    ->select('id_warga')
                    ->where('belum_lunas_count', '>', 0);
            });
        }

        if ($statusIuran === 'Belum Ada Tagihan') {
            return $query->whereNotIn('id_warga', function ($subQuery) {
                $subQuery->from('tagihan_warga')->select('id_warga');
            });
        }

        return $query;
    }

    /**
     * @param  array<int, int>  $wargaIds
     * @return array<int, array{status:string, unpaid:int, total:int}>
     */
    private function buildStatusMap(array $wargaIds): array
    {
        $summaryRows = DB::table('tagihan_warga')
            ->selectRaw("id_warga, SUM(CASE WHEN status_bayar = 'Belum Lunas' THEN 1 ELSE 0 END) AS belum_lunas_count, COUNT(*) AS total_tagihan")
            ->groupBy('id_warga')
            ->get()
            ->keyBy('id_warga');

        $statusMap = [];

        foreach ($wargaIds as $idWarga) {
            $summary = $summaryRows->get($idWarga);
            $unpaid = (int) ($summary->belum_lunas_count ?? 0);
            $total = (int) ($summary->total_tagihan ?? 0);

            $statusMap[$idWarga] = [
                'status' => $this->resolveIuranStatus($total, $unpaid),
                'unpaid' => $unpaid,
                'total' => $total,
            ];
        }

        return $statusMap;
    }

    /**
     * @param  array<int, array{status:string, unpaid:int, total:int}>  $statusMap
     * @return array{
     *     items: array<int, array<string, int|string|null>>,
     *     pagination: array<string, int|null>
     * }
     */
    private function transformResidents(LengthAwarePaginator $paginator, array $statusMap): array
    {
        $items = $paginator->getCollection()
            ->map(function (Warga $warga) use ($statusMap) {
                $status = $statusMap[$warga->id_warga]['status'] ?? 'Belum Ada Tagihan';

                return [
                    'id_warga' => $warga->id_warga,
                    'nama' => $warga->nama,
                    'no_rumah' => $warga->no_rumah,
                    'no_telepon' => $warga->no_telepon,
                    'status_hunian' => $warga->status_hunian,
                    'status_iuran' => $status,
                ];
            })
            ->values()
            ->all();

        return [
            'items' => $items,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ];
    }

    /**
     * @param  array<int, array{status:string, unpaid:int, total:int}>  $statusMap
     * @return array<int, array<string, string|int>>
     */
    private function buildStats(array $statusMap, Collection $blokOptions): array
    {
        $totalWarga = count($statusMap);
        $sudahLunas = 0;
        $belumLunas = 0;

        foreach ($statusMap as $status) {
            if ($status['status'] === 'Lunas') {
                $sudahLunas++;
            }

            if ($status['status'] === 'Belum Lunas') {
                $belumLunas++;
            }
        }

        return [
            [
                'label' => 'Total Warga',
                'value' => (string) $totalWarga,
                'note' => 'Seluruh warga yang terdaftar',
                'noteTone' => 'text-[rgb(var(--ek-success))]',
                'icon' => 'users',
                'iconTone' => 'text-[rgb(var(--ek-accent))]',
            ],
            [
                'label' => 'Sudah Lunas',
                'value' => (string) $sudahLunas,
                'note' => 'Status iuran sudah tuntas',
                'noteTone' => 'text-[rgb(var(--ek-text-muted))]',
                'icon' => 'check',
                'iconTone' => 'text-[rgb(var(--ek-success))]',
            ],
            [
                'label' => 'Belum Lunas',
                'value' => (string) $belumLunas,
                'note' => 'Perlu tindak lanjut pembayaran',
                'noteTone' => 'text-[rgb(var(--ek-danger))]',
                'icon' => 'notification',
                'iconTone' => 'text-[rgb(var(--ek-danger))]',
            ],
            [
                'label' => 'Total Blok',
                'value' => str_pad((string) $blokOptions->count(), 2, '0', STR_PAD_LEFT),
                'note' => 'Diambil dari format no rumah',
                'noteTone' => 'text-[rgb(var(--ek-text-muted))]',
                'icon' => 'map',
                'iconTone' => 'text-[rgb(var(--ek-primary-soft))]',
            ],
        ];
    }

    /**
     * @return Collection<int, string>
     */
    private function extractBlokOptions(): Collection
    {
        return Warga::query()
            ->pluck('no_rumah')
            ->map(fn (?string $value) => $this->extractBlok($value))
            ->filter()
            ->unique()
            ->sort()
            ->values();
    }

    private function extractBlok(?string $noRumah): ?string
    {
        if ($noRumah === null || trim($noRumah) === '') {
            return null;
        }

        $parts = explode('/', $noRumah);

        return trim($parts[0]);
    }

    private function resolveIuranStatus(int $total, int $unpaid): string
    {
        if ($total === 0) {
            return 'Belum Ada Tagihan';
        }

        return $unpaid > 0 ? 'Belum Lunas' : 'Lunas';
    }
}
