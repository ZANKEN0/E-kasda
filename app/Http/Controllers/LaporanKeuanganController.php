<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\StreamsCsv;
use App\Models\TransaksiKas;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LaporanKeuanganController extends Controller
{
    use StreamsCsv;

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
        $selectedMonth = (int) $request->integer('bulan', $today->month);
        $selectedYear = (int) $request->integer('tahun', $today->year);

        if ($selectedMonth < 1 || $selectedMonth > 12) {
            $selectedMonth = $today->month;
        }

        if ($selectedYear < 2000 || $selectedYear > 2100) {
            $selectedYear = $today->year;
        }

        $periodStart = Carbon::create($selectedYear, $selectedMonth, 1)->startOfMonth();
        $periodEnd = $periodStart->copy()->endOfMonth();

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

        [$yearStart, $yearEnd] = $this->resolveYearBounds($selectedYear, $today->year);
        $yearOptions = range($yearEnd, $yearStart);

        return Inertia::render('LaporanKeuangan', [
            'filters' => [
                'bulan' => (string) $selectedMonth,
                'tahun' => (string) $selectedYear,
            ],
            'monthOptions' => collect(self::MONTHS)->map(fn (string $label, int $value) => [
                'value' => $value,
                'label' => $label,
            ])->values()->all(),
            'yearOptions' => $yearOptions,
            'periodLabel' => self::MONTHS[$selectedMonth].' '.$selectedYear,
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
        $today = now();
        $selectedMonth = (int) $request->integer('bulan', $today->month);
        $selectedYear = (int) $request->integer('tahun', $today->year);

        if ($selectedMonth < 1 || $selectedMonth > 12) {
            $selectedMonth = $today->month;
        }

        if ($selectedYear < 2000 || $selectedYear > 2100) {
            $selectedYear = $today->year;
        }

        $periodStart = Carbon::create($selectedYear, $selectedMonth, 1)->startOfMonth();
        $periodEnd = $periodStart->copy()->endOfMonth();

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
            'laporan-keuangan-'.$selectedYear.'-'.str_pad((string) $selectedMonth, 2, '0', STR_PAD_LEFT).'.csv',
            ['Tanggal', 'Jenis Transaksi', 'Kategori', 'Keterangan', 'Sumber', 'Debit', 'Kredit'],
            $rows,
            [
                ['Periode', self::MONTHS[$selectedMonth].' '.$selectedYear],
                ['Saldo Awal', $saldoAwal],
                ['Total Masuk', $totalMasuk],
                ['Total Keluar', $totalKeluar],
                ['Saldo Akhir', $saldoAkhir],
            ],
        );
    }

    private function resolveYearBounds(int $selectedYear, int $fallbackYear): array
    {
        $minDate = TransaksiKas::query()->min('tgl_transaksi');
        $maxDate = TransaksiKas::query()->max('tgl_transaksi');

        $minYear = $minDate ? Carbon::parse($minDate)->year : $fallbackYear;
        $maxYear = $maxDate ? Carbon::parse($maxDate)->year : $fallbackYear;

        $yearStart = min($minYear, $selectedYear, $fallbackYear);
        $yearEnd = max($maxYear, $selectedYear, $fallbackYear);

        return [$yearStart, $yearEnd];
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
