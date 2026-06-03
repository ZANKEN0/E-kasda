<?php

namespace App\Http\Controllers;

use App\Models\TagihanWarga;
use App\Models\TransaksiKas;
use App\Models\Warga;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
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

    public function __invoke(): Response
    {
        $today = now();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();
        $previousMonthStart = $monthStart->copy()->subMonth()->startOfMonth();
        $previousMonthEnd = $monthStart->copy()->subMonth()->endOfMonth();

        $saldoKas = (float) TransaksiKas::query()
            ->selectRaw("COALESCE(SUM(CASE WHEN jenis_transaksi = 'Masuk' THEN jumlah ELSE -jumlah END), 0) as saldo")
            ->value('saldo');

        $pemasukanBulanIni = (float) TransaksiKas::query()
            ->whereBetween('tgl_transaksi', [$monthStart, $monthEnd])
            ->where('jenis_transaksi', 'Masuk')
            ->sum('jumlah');

        $pemasukanBulanLalu = (float) TransaksiKas::query()
            ->whereBetween('tgl_transaksi', [$previousMonthStart, $previousMonthEnd])
            ->where('jenis_transaksi', 'Masuk')
            ->sum('jumlah');

        $pengeluaranBulanIni = (float) TransaksiKas::query()
            ->whereBetween('tgl_transaksi', [$monthStart, $monthEnd])
            ->where('jenis_transaksi', 'Keluar')
            ->sum('jumlah');

        $totalWarga = Warga::query()->count();
        $wargaTetap = Warga::query()->where('status_hunian', 'Tetap')->count();
        $wargaKontrak = Warga::query()->where('status_hunian', 'Kontrak')->count();

        $unpaidQuery = TagihanWarga::query()
            ->with(['warga', 'iuranWajib'])
            ->where('status_bayar', 'Belum Lunas');

        $unpaidCount = (clone $unpaidQuery)->count();
        $unpaidTotal = (float) (clone $unpaidQuery)->sum('nominal');
        $jatuhTempoTerdekat = (clone $unpaidQuery)
            ->whereNotNull('tanggal_jatuh_tempo')
            ->orderBy('tanggal_jatuh_tempo')
            ->value('tanggal_jatuh_tempo');

        $topUnpaid = (clone $unpaidQuery)
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->orderByDesc('id_tagihan')
            ->limit(5)
            ->get()
            ->map(function (TagihanWarga $tagihan) {
                return [
                    'nama_warga' => $tagihan->warga?->nama ?? '-',
                    'blok' => $this->extractBlok($tagihan->warga?->no_rumah),
                    'jenis_iuran' => $tagihan->iuranWajib?->nama_iuran ?? '-',
                    'nominal' => $this->formatCurrency((float) $tagihan->nominal),
                ];
            })
            ->values()
            ->all();

        $latestTransactions = TransaksiKas::query()
            ->with('kategori')
            ->orderByDesc('tgl_transaksi')
            ->orderByDesc('id_transaksi')
            ->limit(5)
            ->get()
            ->map(function (TransaksiKas $transaksi) {
                return [
                    'tanggal' => $this->formatDate($transaksi->tgl_transaksi),
                    'jenis' => $transaksi->jenis_transaksi === 'Masuk' ? 'Kas Masuk' : 'Kas Keluar',
                    'keterangan' => $transaksi->keterangan ?: ($transaksi->kategori?->nama_kategori ?? '-'),
                    'nominal' => $this->formatCurrency((float) $transaksi->jumlah),
                ];
            })
            ->values()
            ->all();

        $latestTransactionDate = TransaksiKas::query()->max('tgl_transaksi');

        return Inertia::render('Dashboard', [
            'summaryCards' => [
                [
                    'title' => 'Saldo Kas Saat Ini',
                    'value' => $this->formatCurrency($saldoKas),
                    'note' => $latestTransactionDate
                        ? 'Pembaruan terakhir '.$this->formatDate(Carbon::parse($latestTransactionDate))
                        : 'Belum ada transaksi kas tercatat',
                ],
                [
                    'title' => 'Pemasukan Bulan Ini',
                    'value' => $this->formatCurrency($pemasukanBulanIni),
                    'note' => $this->growthNote($pemasukanBulanIni, $pemasukanBulanLalu),
                ],
                [
                    'title' => 'Pengeluaran Bulan Ini',
                    'value' => $this->formatCurrency($pengeluaranBulanIni),
                    'note' => 'Periode '.self::MONTHS[$today->month].' '.$today->year,
                ],
                [
                    'title' => 'Jumlah Warga Aktif',
                    'value' => $totalWarga.' KK',
                    'note' => $wargaTetap.' warga tetap dan '.$wargaKontrak.' kontrakan',
                ],
            ],
            'alertRows' => [
                $unpaidCount > 0
                    ? $unpaidCount.' tagihan warga masih berstatus belum lunas dengan total '.$this->formatCurrency($unpaidTotal).'.'
                    : 'Tidak ada tagihan belum lunas pada periode aktif saat ini.',
                $jatuhTempoTerdekat
                    ? 'Jatuh tempo terdekat pada '.$this->formatDate(Carbon::parse($jatuhTempoTerdekat)).'.'
                    : 'Belum ada jatuh tempo tagihan yang tercatat.',
            ],
            'unpaidRows' => $topUnpaid,
            'transactionRows' => $latestTransactions,
        ]);
    }

    private function growthNote(float $current, float $previous): string
    {
        if ($previous <= 0.0) {
            return $current > 0 ? 'Belum ada pembanding bulan lalu' : 'Belum ada pemasukan pada bulan ini';
        }

        $delta = (($current - $previous) / $previous) * 100;
        $prefix = $delta >= 0 ? '+' : '';

        return $prefix.number_format($delta, 1, ',', '.').'% dari bulan lalu';
    }

    private function extractBlok(?string $noRumah): string
    {
        if (! $noRumah) {
            return '-';
        }

        $parts = preg_split('/\//', $noRumah);

        return trim($parts[0] ?: $noRumah);
    }

    private function formatCurrency(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }

    private function formatDate(Carbon $date): string
    {
        return $date->day.' '.self::SHORT_MONTHS[$date->month].' '.$date->year;
    }
}