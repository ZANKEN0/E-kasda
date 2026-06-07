<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\StreamsCsv;
use App\Models\TransaksiKas;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LaporanKeuanganController extends Controller
{
    use StreamsCsv;

    private const REPORT_MODES = [
        'bulanan',
        'rentang',
        'tahunan',
    ];

    private const MONTHS = [
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

    private const SHORT_MONTHS = [
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

    public function index(Request $request): Response
    {
        $today = now();
        $reportContext = $this->resolveReportContext($request, $today);
        $periodStart = $reportContext['period_start'];
        $periodEnd = $reportContext['period_end'];

        $periodQuery = TransaksiKas::query()
            ->with('kategori')
            ->whereBetween('tgl_transaksi', [$periodStart, $periodEnd]);

        $paginator = (clone $periodQuery)
            ->orderByDesc('tgl_transaksi')
            ->orderByDesc('id_transaksi')
            ->paginate(10)
            ->withQueryString();

        $transactions = $paginator->getCollection()->map(function (TransaksiKas $transaksi) {
            $amount = (float) $transaksi->jumlah;

            return [
                'id_transaksi' => $transaksi->id_transaksi,
                'tanggal' => $this->formatDate($transaksi->tgl_transaksi),
                'jenis_transaksi' => $transaksi->jenis_transaksi,
                'kategori' => $transaksi->kategori?->nama_kategori ?? 'Tanpa Kategori',
                'keterangan' => $transaksi->keterangan,
                'debit' => $transaksi->jenis_transaksi === 'Masuk' ? $this->formatCurrency($amount) : '-',
                'kredit' => $transaksi->jenis_transaksi === 'Keluar' ? $this->formatCurrency($amount) : '-',
                'sumber' => $transaksi->id_pembayaran !== null ? 'Pembayaran iuran' : 'Transaksi manual',
            ];
        })->values()->all();

        $saldoAwal = (float) TransaksiKas::query()
            ->where('tgl_transaksi', '<', $periodStart)
            ->selectRaw("COALESCE(SUM(CASE WHEN jenis_transaksi = 'Masuk' THEN jumlah ELSE -jumlah END), 0) as saldo")
            ->value('saldo');

        $totalMasuk = (float) (clone $periodQuery)
            ->where('jenis_transaksi', 'Masuk')
            ->sum('jumlah');

        $totalKeluar = (float) (clone $periodQuery)
            ->where('jenis_transaksi', 'Keluar')
            ->sum('jumlah');

        $saldoAkhir = $saldoAwal + $totalMasuk - $totalKeluar;
        $jumlahTransaksi = (clone $periodQuery)->count();

        $categoryBreakdown = TransaksiKas::query()
            ->leftJoin('kategori', 'kategori.id_kategori', '=', 'transaksi_kas.id_kategori')
            ->whereBetween('tgl_transaksi', [$periodStart, $periodEnd])
            ->groupBy('transaksi_kas.id_kategori', 'kategori.nama_kategori', 'transaksi_kas.jenis_transaksi')
            ->selectRaw("COALESCE(kategori.nama_kategori, 'Tanpa Kategori') as kategori")
            ->selectRaw('transaksi_kas.jenis_transaksi as jenis_transaksi')
            ->selectRaw('COUNT(*) as jumlah_transaksi')
            ->selectRaw('SUM(transaksi_kas.jumlah) as total')
            ->orderByDesc('total')
            ->get()
            ->map(function ($row) {
                return [
                    'kategori' => $row->kategori,
                    'jenis_transaksi' => $row->jenis_transaksi,
                    'jumlah_transaksi' => (int) $row->jumlah_transaksi,
                    'total' => $this->formatCurrency((float) $row->total),
                ];
            })
            ->values()
            ->all();

        [$yearStart, $yearEnd] = $this->resolveYearBounds($reportContext['candidate_years'], $today->year);
        $yearOptions = range($yearEnd, $yearStart);

        return Inertia::render('LaporanKeuangan', [
            'filters' => $reportContext['filters'],
            'monthOptions' => collect(self::MONTHS)->map(fn (string $label, int $value) => [
                'value' => $value,
                'label' => $label,
            ])->values()->all(),
            'reportModeOptions' => [
                ['value' => 'bulanan', 'label' => 'Bulanan'],
                ['value' => 'rentang', 'label' => 'Rentang Periode'],
                ['value' => 'tahunan', 'label' => 'Tahunan'],
            ],
            'yearOptions' => $yearOptions,
            'periodLabel' => $reportContext['period_label'],
            'summary' => [
                'saldo_awal' => $this->formatCurrency($saldoAwal),
                'total_masuk' => $this->formatCurrency($totalMasuk),
                'total_keluar' => $this->formatCurrency($totalKeluar),
                'saldo_akhir' => $this->formatCurrency($saldoAkhir),
                'jumlah_transaksi' => $jumlahTransaksi,
            ],
            'transactions' => $transactions,
            'categoryBreakdown' => $categoryBreakdown,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $reportContext = $this->resolveReportContext($request, now());
        $periodStart = $reportContext['period_start'];
        $periodEnd = $reportContext['period_end'];

        $periodQuery = TransaksiKas::query()
            ->with('kategori')
            ->whereBetween('tgl_transaksi', [$periodStart, $periodEnd]);

        $saldoAwal = (float) TransaksiKas::query()
            ->where('tgl_transaksi', '<', $periodStart)
            ->selectRaw("COALESCE(SUM(CASE WHEN jenis_transaksi = 'Masuk' THEN jumlah ELSE -jumlah END), 0) as saldo")
            ->value('saldo');

        $totalMasuk = (float) (clone $periodQuery)
            ->where('jenis_transaksi', 'Masuk')
            ->sum('jumlah');

        $totalKeluar = (float) (clone $periodQuery)
            ->where('jenis_transaksi', 'Keluar')
            ->sum('jumlah');

        $saldoAkhir = $saldoAwal + $totalMasuk - $totalKeluar;

        $rows = (clone $periodQuery)
            ->orderByDesc('tgl_transaksi')
            ->orderByDesc('id_transaksi')
            ->get()
            ->map(function (TransaksiKas $transaksi) {
                $amount = (float) $transaksi->jumlah;

                return [
                    $this->formatDate($transaksi->tgl_transaksi),
                    $transaksi->jenis_transaksi,
                    $transaksi->kategori?->nama_kategori ?? 'Tanpa Kategori',
                    $transaksi->keterangan,
                    $transaksi->id_pembayaran !== null ? 'Pembayaran iuran' : 'Transaksi manual',
                    $transaksi->jenis_transaksi === 'Masuk' ? $amount : null,
                    $transaksi->jenis_transaksi === 'Keluar' ? $amount : null,
                ];
            });

        return $this->streamCsv(
            'laporan-keuangan-'.$reportContext['file_suffix'].'.csv',
            ['Tanggal', 'Jenis Transaksi', 'Kategori', 'Keterangan', 'Sumber', 'Debit', 'Kredit'],
            $rows,
            [
                ['Periode', $reportContext['period_label']],
                ['Saldo Awal', $saldoAwal],
                ['Total Masuk', $totalMasuk],
                ['Total Keluar', $totalKeluar],
                ['Saldo Akhir', $saldoAkhir],
            ],
        );
    }

    public function exportPdf(Request $request): HttpResponse
    {
        $reportContext = $this->resolveReportContext($request, now());
        $periodStart = $reportContext['period_start'];
        $periodEnd = $reportContext['period_end'];

        $periodQuery = TransaksiKas::query()
            ->with('kategori')
            ->whereBetween('tgl_transaksi', [$periodStart, $periodEnd]);

        $transactions = (clone $periodQuery)
            ->orderByDesc('tgl_transaksi')
            ->orderByDesc('id_transaksi')
            ->get()
            ->map(function (TransaksiKas $transaksi) {
                $amount = (float) $transaksi->jumlah;

                return [
                    'tanggal' => $this->formatDate($transaksi->tgl_transaksi),
                    'jenis_transaksi' => $transaksi->jenis_transaksi,
                    'kategori' => $transaksi->kategori?->nama_kategori ?? 'Tanpa Kategori',
                    'keterangan' => $transaksi->keterangan,
                    'debit' => $transaksi->jenis_transaksi === 'Masuk' ? $this->formatCurrency($amount) : '-',
                    'kredit' => $transaksi->jenis_transaksi === 'Keluar' ? $this->formatCurrency($amount) : '-',
                    'sumber' => $transaksi->id_pembayaran !== null ? 'Pembayaran iuran' : 'Transaksi manual',
                ];
            })
            ->values()
            ->all();

        $saldoAwal = (float) TransaksiKas::query()
            ->where('tgl_transaksi', '<', $periodStart)
            ->selectRaw("COALESCE(SUM(CASE WHEN jenis_transaksi = 'Masuk' THEN jumlah ELSE -jumlah END), 0) as saldo")
            ->value('saldo');

        $totalMasuk = (float) (clone $periodQuery)
            ->where('jenis_transaksi', 'Masuk')
            ->sum('jumlah');

        $totalKeluar = (float) (clone $periodQuery)
            ->where('jenis_transaksi', 'Keluar')
            ->sum('jumlah');

        $saldoAkhir = $saldoAwal + $totalMasuk - $totalKeluar;
        $jumlahTransaksi = (clone $periodQuery)->count();

        $categoryBreakdown = TransaksiKas::query()
            ->leftJoin('kategori', 'kategori.id_kategori', '=', 'transaksi_kas.id_kategori')
            ->whereBetween('tgl_transaksi', [$periodStart, $periodEnd])
            ->groupBy('transaksi_kas.id_kategori', 'kategori.nama_kategori', 'transaksi_kas.jenis_transaksi')
            ->selectRaw("COALESCE(kategori.nama_kategori, 'Tanpa Kategori') as kategori")
            ->selectRaw('transaksi_kas.jenis_transaksi as jenis_transaksi')
            ->selectRaw('COUNT(*) as jumlah_transaksi')
            ->selectRaw('SUM(transaksi_kas.jumlah) as total')
            ->orderByDesc('total')
            ->get()
            ->map(function ($row) {
                return [
                    'kategori' => $row->kategori,
                    'jenis_transaksi' => $row->jenis_transaksi,
                    'jumlah_transaksi' => (int) $row->jumlah_transaksi,
                    'total' => $this->formatCurrency((float) $row->total),
                ];
            })
            ->values()
            ->all();

        $html = view('reports.laporan-keuangan-pdf', [
            'title' => 'Laporan Keuangan E-KASDA',
            'subTitle' => 'RT 01 / RW 06 Ciledug - Rekap kas dan transaksi periode berjalan',
            'periodLabel' => $reportContext['period_label'],
            'generatedAt' => now()->translatedFormat('d F Y H:i'),
            'generatedBy' => $request->user()?->nama_lengkap ?? $request->user()?->name ?? 'Pengurus RT',
            'summary' => [
                'saldo_awal' => $this->formatCurrency($saldoAwal),
                'total_masuk' => $this->formatCurrency($totalMasuk),
                'total_keluar' => $this->formatCurrency($totalKeluar),
                'saldo_akhir' => $this->formatCurrency($saldoAkhir),
                'jumlah_transaksi' => $jumlahTransaksi,
            ],
            'transactions' => $transactions,
            'categoryBreakdown' => $categoryBreakdown,
        ])->render();

        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        $fileName = 'laporan-keuangan-'.$reportContext['file_suffix'].'.pdf';

        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
        ]);
    }

    private function resolveYearBounds(array $candidateYears, int $fallbackYear): array
    {
        $minDate = TransaksiKas::query()->min('tgl_transaksi');
        $maxDate = TransaksiKas::query()->max('tgl_transaksi');

        $minYear = $minDate ? Carbon::parse($minDate)->year : $fallbackYear;
        $maxYear = $maxDate ? Carbon::parse($maxDate)->year : $fallbackYear;

        $yearStart = min($minYear, $fallbackYear, ...$candidateYears);
        $yearEnd = max($maxYear, $fallbackYear, ...$candidateYears);

        return [$yearStart, $yearEnd];
    }

    private function resolveReportContext(Request $request, Carbon $today): array
    {
        $mode = $request->string('mode_laporan')->toString();

        if (! in_array($mode, self::REPORT_MODES, true)) {
            $mode = 'bulanan';
        }

        $selectedMonth = (int) $request->integer('bulan', $today->month);
        $selectedYear = (int) $request->integer('tahun', $today->year);
        $startMonth = (int) $request->integer('bulan_mulai', $selectedMonth);
        $startYear = (int) $request->integer('tahun_mulai', $selectedYear);
        $endMonth = (int) $request->integer('bulan_selesai', $selectedMonth);
        $endYear = (int) $request->integer('tahun_selesai', $selectedYear);
        $annualYear = (int) $request->integer('tahun_laporan', $selectedYear);

        $selectedMonth = $this->normalizeMonth($selectedMonth, $today->month);
        $selectedYear = $this->normalizeYear($selectedYear, $today->year);
        $startMonth = $this->normalizeMonth($startMonth, $selectedMonth);
        $startYear = $this->normalizeYear($startYear, $selectedYear);
        $endMonth = $this->normalizeMonth($endMonth, $selectedMonth);
        $endYear = $this->normalizeYear($endYear, $selectedYear);
        $annualYear = $this->normalizeYear($annualYear, $selectedYear);

        if ($mode === 'rentang') {
            $periodStart = Carbon::create($startYear, $startMonth, 1)->startOfMonth();
            $periodEnd = Carbon::create($endYear, $endMonth, 1)->endOfMonth();

            if ($periodEnd->lessThan($periodStart)) {
                [$periodStart, $periodEnd] = [$periodEnd->copy()->startOfMonth(), $periodStart->copy()->endOfMonth()];
            }

            $periodLabel = self::MONTHS[$periodStart->month].' '.$periodStart->year.' - '.self::MONTHS[$periodEnd->month].' '.$periodEnd->year;
            $fileSuffix = $periodStart->format('Y-m').'-sampai-'.$periodEnd->format('Y-m');
        } elseif ($mode === 'tahunan') {
            $periodStart = Carbon::create($annualYear, 1, 1)->startOfYear();
            $periodEnd = $periodStart->copy()->endOfYear();
            $periodLabel = 'Tahun '.$annualYear;
            $fileSuffix = (string) $annualYear;
        } else {
            $periodStart = Carbon::create($selectedYear, $selectedMonth, 1)->startOfMonth();
            $periodEnd = $periodStart->copy()->endOfMonth();
            $periodLabel = self::MONTHS[$selectedMonth].' '.$selectedYear;
            $fileSuffix = $periodStart->format('Y-m');
        }

        return [
            'mode_laporan' => $mode,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'period_label' => $periodLabel,
            'file_suffix' => $fileSuffix,
            'candidate_years' => [
                $selectedYear,
                $startYear,
                $endYear,
                $annualYear,
                $periodStart->year,
                $periodEnd->year,
            ],
            'filters' => [
                'mode_laporan' => $mode,
                'bulan' => (string) $selectedMonth,
                'tahun' => (string) $selectedYear,
                'bulan_mulai' => (string) $periodStart->month,
                'tahun_mulai' => (string) $periodStart->year,
                'bulan_selesai' => (string) $periodEnd->month,
                'tahun_selesai' => (string) $periodEnd->year,
                'tahun_laporan' => (string) $annualYear,
            ],
        ];
    }

    private function normalizeMonth(int $month, int $fallback): int
    {
        if ($month < 1 || $month > 12) {
            return $fallback;
        }

        return $month;
    }

    private function normalizeYear(int $year, int $fallback): int
    {
        if ($year < 2000 || $year > 2100) {
            return $fallback;
        }

        return $year;
    }

    private function formatCurrency(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }

    private function formatDate(?Carbon $date): string
    {
        if (! $date) {
            return '-';
        }

        return $date->day.' '.self::SHORT_MONTHS[$date->month].' '.$date->year;
    }
}
