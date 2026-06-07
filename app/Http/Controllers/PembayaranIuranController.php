<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePembayaranIuranRequest;
use App\Models\IuranWajib;
use App\Models\Kategori;
use App\Models\PembayaranIuran;
use App\Models\TagihanWarga;
use App\Models\TransaksiKas;
use App\Models\Warga;
use Dompdf\Dompdf;
use Dompdf\Options;
use DomainException;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PembayaranIuranController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'scope' => trim($request->string('scope')->toString()) ?: 'resident',
            'search' => trim($request->string('search')->toString()),
            'id_warga' => trim($request->string('id_warga')->toString()),
            'bulan' => trim($request->string('bulan')->toString()),
            'tahun' => trim($request->string('tahun')->toString()),
            'id_iuran_wajib' => trim($request->string('id_iuran_wajib')->toString()),
        ];

        $residentOptions = Warga::query()
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = '%'.$filters['search'].'%';

                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('nama', 'like', $search)
                        ->orWhere('no_rumah', 'like', $search)
                        ->orWhere('no_telepon', 'like', $search);
                });
            })
            ->orderBy('nama')
            ->get(['id_warga', 'nama', 'no_rumah'])
            ->map(fn (Warga $warga) => [
                'id_warga' => $warga->id_warga,
                'label' => $warga->nama.($warga->no_rumah ? ' - '.$warga->no_rumah : ''),
            ])
            ->values();

        $iuranOptions = IuranWajib::query()
            ->orderBy('nama_iuran')
            ->get(['id_iuran_wajib', 'nama_iuran'])
            ->map(fn (IuranWajib $iuran) => [
                'id_iuran_wajib' => $iuran->id_iuran_wajib,
                'label' => $iuran->nama_iuran,
            ])
            ->values()
            ->all();

        $selectedResident = null;
        $activeBills = [];
        $history = [];
        $selectedScope = $filters['scope'] === 'batch' ? 'batch' : 'resident';
        $selectedResidentId = $filters['id_warga'] !== '' ? (int) $filters['id_warga'] : null;

        if ($selectedScope === 'resident' && $selectedResidentId) {
            $resident = Warga::query()->find($selectedResidentId);

            if ($resident) {
                $selectedResident = [
                    'id_warga' => $resident->id_warga,
                    'nama' => $resident->nama,
                    'no_rumah' => $resident->no_rumah,
                    'no_telepon' => $resident->no_telepon,
                    'status_hunian' => $resident->status_hunian,
                ];

                $activeBills = TagihanWarga::query()
                    ->with('iuranWajib')
                    ->where('id_warga', $resident->id_warga)
                    ->where('status_bayar', 'Belum Lunas')
                    ->orderByDesc('tahun')
                    ->orderByDesc('bulan')
                    ->get()
                    ->map(fn (TagihanWarga $tagihan) => [
                        'id_tagihan' => $tagihan->id_tagihan,
                        'id_warga' => $tagihan->id_warga,
                        'nama_warga' => $tagihan->warga?->nama ?? $resident->nama,
                        'no_rumah' => $tagihan->warga?->no_rumah ?? $resident->no_rumah,
                        'nama_iuran' => $tagihan->iuranWajib?->nama_iuran ?? '-',
                        'periode' => $this->periodLabel((int) $tagihan->bulan, (int) $tagihan->tahun),
                        'nominal' => (float) $tagihan->nominal,
                        'nominal_formatted' => $this->formatCurrency((float) $tagihan->nominal),
                        'status_bayar' => $tagihan->status_bayar,
                    ])
                    ->values()
                    ->all();

                $history = PembayaranIuran::query()
                    ->with(['tagihanWarga.warga', 'tagihanWarga.iuranWajib'])
                    ->whereHas('tagihanWarga', function ($query) use ($resident) {
                        $query->where('id_warga', $resident->id_warga);
                    })
                    ->orderByDesc('tanggal_bayar')
                    ->limit(10)
                    ->get()
                    ->map(fn (PembayaranIuran $pembayaran) => [
                        'id_pembayaran' => $pembayaran->id_pembayaran,
                        'tanggal_bayar' => optional($pembayaran->tanggal_bayar)?->format('d M Y'),
                        'nama_warga' => $pembayaran->tagihanWarga?->warga?->nama ?? $resident->nama,
                        'nama_iuran' => $pembayaran->tagihanWarga?->iuranWajib?->nama_iuran ?? '-',
                        'periode' => $this->periodLabel(
                            (int) ($pembayaran->tagihanWarga?->bulan ?? 0),
                            (int) ($pembayaran->tagihanWarga?->tahun ?? 0),
                        ),
                        'jumlah_bayar' => $this->formatCurrency((float) $pembayaran->jumlah_bayar),
                        'status' => 'Lunas',
                        'kwitansi_url' => route('pembayaran-iuran.receipt', $pembayaran),
                    ])
                    ->values()
                    ->all();
            }
        }

        if ($selectedScope === 'batch') {
            $batchQuery = TagihanWarga::query()
                ->with(['warga', 'iuranWajib'])
                ->where('status_bayar', 'Belum Lunas');

            if ($filters['bulan'] !== '') {
                $batchQuery->where('bulan', (int) $filters['bulan']);
            }

            if ($filters['tahun'] !== '') {
                $batchQuery->where('tahun', (int) $filters['tahun']);
            }

            if ($filters['id_iuran_wajib'] !== '') {
                $batchQuery->where('id_iuran_wajib', (int) $filters['id_iuran_wajib']);
            }

            if ($filters['search'] !== '') {
                $search = '%'.$filters['search'].'%';

                $batchQuery->where(function ($builder) use ($search) {
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

            $activeBills = $batchQuery
                ->orderByDesc('tahun')
                ->orderByDesc('bulan')
                ->orderBy('id_warga')
                ->get()
                ->map(fn (TagihanWarga $tagihan) => [
                    'id_tagihan' => $tagihan->id_tagihan,
                    'id_warga' => $tagihan->id_warga,
                    'nama_warga' => $tagihan->warga?->nama ?? '-',
                    'no_rumah' => $tagihan->warga?->no_rumah ?? '-',
                    'nama_iuran' => $tagihan->iuranWajib?->nama_iuran ?? '-',
                    'periode' => $this->periodLabel((int) $tagihan->bulan, (int) $tagihan->tahun),
                    'nominal' => (float) $tagihan->nominal,
                    'nominal_formatted' => $this->formatCurrency((float) $tagihan->nominal),
                    'status_bayar' => $tagihan->status_bayar,
                ])
                ->values()
                ->all();

            $history = PembayaranIuran::query()
                ->with(['tagihanWarga.warga', 'tagihanWarga.iuranWajib'])
                ->orderByDesc('tanggal_bayar')
                ->limit(10)
                ->get()
                ->map(fn (PembayaranIuran $pembayaran) => [
                    'id_pembayaran' => $pembayaran->id_pembayaran,
                    'tanggal_bayar' => optional($pembayaran->tanggal_bayar)?->format('d M Y'),
                    'nama_warga' => $pembayaran->tagihanWarga?->warga?->nama ?? '-',
                    'nama_iuran' => $pembayaran->tagihanWarga?->iuranWajib?->nama_iuran ?? '-',
                    'periode' => $this->periodLabel(
                        (int) ($pembayaran->tagihanWarga?->bulan ?? 0),
                        (int) ($pembayaran->tagihanWarga?->tahun ?? 0),
                    ),
                    'jumlah_bayar' => $this->formatCurrency((float) $pembayaran->jumlah_bayar),
                    'status' => 'Lunas',
                    'kwitansi_url' => route('pembayaran-iuran.receipt', $pembayaran),
                ])
                ->values()
                ->all();
        }

        $totalKas = (float) TransaksiKas::query()
            ->selectRaw("COALESCE(SUM(CASE WHEN jenis_transaksi = 'Masuk' THEN jumlah ELSE -jumlah END), 0) as saldo")
            ->value('saldo');

        return Inertia::render('PembayaranIuran', [
            'filters' => $filters,
            'residentOptions' => $residentOptions->all(),
            'iuranOptions' => $iuranOptions,
            'selectedResident' => $selectedResident,
            'activeBills' => $activeBills,
            'history' => $history,
            'totalKas' => $this->formatCurrency($totalKas),
            'paymentMethods' => ['Tunai', 'Transfer Bank', 'QRIS'],
            'monthOptions' => $this->monthOptions(),
            'yearOptions' => $this->yearOptions(),
        ]);
    }

    public function store(StorePembayaranIuranRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $tagihanIds = $validated['tagihan_ids'];
        $paymentScope = $validated['payment_scope'] ?? 'resident';

        try {
            DB::transaction(function () use ($tagihanIds, $validated, $request, $paymentScope) {
                $tagihanList = TagihanWarga::query()
                    ->with('iuranWajib')
                    ->whereIn('id_tagihan', $tagihanIds)
                    ->lockForUpdate()
                    ->get();

                if ($tagihanList->count() !== count($tagihanIds)) {
                    throw new DomainException('Sebagian tagihan tidak ditemukan lagi. Silakan muat ulang halaman.');
                }

                if (
                    $paymentScope === 'resident'
                    && $tagihanList->contains(fn (TagihanWarga $tagihan) => (int) $tagihan->id_warga !== (int) $validated['id_warga'])
                ) {
                    throw new DomainException('Semua tagihan yang dibayar harus milik warga yang sama.');
                }

                if ($paymentScope === 'batch') {
                    if (
                        $tagihanList->contains(
                            fn (TagihanWarga $tagihan) => (int) $tagihan->bulan !== (int) $validated['bulan']
                                || (int) $tagihan->tahun !== (int) $validated['tahun']
                        )
                    ) {
                        throw new DomainException('Semua tagihan yang dibayar massal harus sesuai dengan bulan dan tahun filter yang dipilih.');
                    }

                    if (
                        ! empty($validated['id_iuran_wajib'])
                        && $tagihanList->contains(
                            fn (TagihanWarga $tagihan) => (int) $tagihan->id_iuran_wajib !== (int) $validated['id_iuran_wajib']
                        )
                    ) {
                        throw new DomainException('Semua tagihan yang dibayar massal harus sesuai dengan jenis iuran yang dipilih.');
                    }
                }

                if ($tagihanList->contains(fn (TagihanWarga $tagihan) => $tagihan->status_bayar !== 'Belum Lunas')) {
                    throw new DomainException('Terdapat tagihan yang sudah lunas sehingga pembayaran dibatalkan.');
                }

                $expectedTotal = (float) $tagihanList->sum(fn (TagihanWarga $tagihan) => (float) $tagihan->nominal);
                $submittedTotal = (float) $validated['jumlah_bayar'];

                if (round($expectedTotal, 2) !== round($submittedTotal, 2)) {
                    throw new DomainException('Nominal bayar harus sama dengan total tagihan yang dipilih.');
                }

                $kategori = Kategori::query()->firstOrCreate(
                    [
                        'nama_kategori' => 'Pembayaran Iuran',
                        'tipe' => 'Masuk',
                    ],
                    [
                        'is_active' => true,
                    ],
                );

                foreach ($tagihanList as $tagihan) {
                    $pembayaran = PembayaranIuran::create([
                        'id_tagihan' => $tagihan->id_tagihan,
                        'id_user' => $request->user()->getKey(),
                        'tanggal_bayar' => $validated['tanggal_bayar'],
                        'jumlah_bayar' => $tagihan->nominal,
                        'metode_bayar' => $validated['metode_bayar'],
                        'catatan' => $validated['catatan'] ?: null,
                    ]);

                    $tagihan->update([
                        'status_bayar' => 'Lunas',
                        'tanggal_lunas' => $validated['tanggal_bayar'],
                        'catatan' => $validated['catatan'] ?: $tagihan->catatan,
                    ]);

                    TransaksiKas::create([
                        'id_kategori' => $kategori->id_kategori,
                        'id_user' => $request->user()->getKey(),
                        'id_tagihan' => $tagihan->id_tagihan,
                        'id_pembayaran' => $pembayaran->id_pembayaran,
                        'tgl_transaksi' => $validated['tanggal_bayar'],
                        'jenis_transaksi' => 'Masuk',
                        'jumlah' => $tagihan->nominal,
                        'keterangan' => 'Pembayaran '.$tagihan->iuranWajib?->nama_iuran.' untuk '.$this->periodLabel((int) $tagihan->bulan, (int) $tagihan->tahun),
                    ]);
                }
            });
        } catch (DomainException $exception) {
            return redirect()
                ->route('pembayaran-iuran', $this->redirectFilters($validated, $paymentScope))
                ->with('error', $exception->getMessage());
        } catch (QueryException $exception) {
            if ((int) $exception->getCode() === 23000) {
                return redirect()
                    ->route('pembayaran-iuran', $this->redirectFilters($validated, $paymentScope))
                    ->with('error', 'Tagihan ini baru saja diproses oleh pengguna lain. Silakan muat ulang halaman.');
            }

            throw $exception;
        }

        return redirect()
            ->route('pembayaran-iuran', $this->redirectFilters($validated, $paymentScope))
            ->with(
                'success',
                $paymentScope === 'batch'
                    ? 'Pembayaran massal berhasil disimpan dan seluruh tagihan terpilih otomatis dilunasi.'
                    : 'Pembayaran iuran berhasil disimpan dan tagihan otomatis dilunasi.',
            );
    }

    public function receiptPdf(PembayaranIuran $pembayaranIuran): HttpResponse
    {
        $pembayaranIuran->loadMissing([
            'tagihanWarga.warga',
            'tagihanWarga.iuranWajib',
            'user',
        ]);

        $tagihan = $pembayaranIuran->tagihanWarga;
        $warga = $tagihan?->warga;

        $html = view('reports.kwitansi-pembayaran-iuran-pdf', [
            'title' => 'Kwitansi Pembayaran Iuran',
            'receiptNumber' => 'KWT-'.str_pad((string) $pembayaranIuran->id_pembayaran, 6, '0', STR_PAD_LEFT),
            'generatedAt' => now()->translatedFormat('d F Y H:i'),
            'paidAt' => $this->formatReceiptDate($pembayaranIuran->tanggal_bayar),
            'wargaName' => $warga?->nama ?? '-',
            'wargaAddress' => $warga?->no_rumah ?? '-',
            'phoneNumber' => $warga?->no_telepon ?? '-',
            'iuranName' => $tagihan?->iuranWajib?->nama_iuran ?? '-',
            'periodLabel' => $this->periodLabel(
                (int) ($tagihan?->bulan ?? 0),
                (int) ($tagihan?->tahun ?? 0),
            ),
            'paymentMethod' => $pembayaranIuran->metode_bayar,
            'amount' => $this->formatCurrency((float) $pembayaranIuran->jumlah_bayar),
            'note' => $pembayaranIuran->catatan,
            'receivedBy' => $pembayaranIuran->user?->nama_lengkap ?? $pembayaranIuran->user?->name ?? 'Pengurus RT',
        ])->render();

        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A5', 'portrait');
        $dompdf->render();

        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="kwitansi-pembayaran-'.$pembayaranIuran->id_pembayaran.'.pdf"',
        ]);
    }

    private function formatCurrency(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }

    private function formatReceiptDate(Carbon|string|null $date): string
    {
        if (! $date) {
            return '-';
        }

        if (is_string($date)) {
            $date = Carbon::parse($date);
        }

        return $date->translatedFormat('d F Y');
    }

    private function periodLabel(int $month, int $year): string
    {
        $months = $this->monthOptions();

        return ($months[$month] ?? 'Bulan').' '.$year;
    }

    /**
     * @return array<string, int|string>
     */
    private function redirectFilters(array $validated, string $paymentScope): array
    {
        return $paymentScope === 'batch'
            ? [
                'scope' => 'batch',
                'bulan' => $validated['bulan'] ?? '',
                'tahun' => $validated['tahun'] ?? '',
                'id_iuran_wajib' => $validated['id_iuran_wajib'] ?? '',
            ]
            : [
                'scope' => 'resident',
                'id_warga' => $validated['id_warga'] ?? '',
            ];
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
