<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransaksiKasRequest;
use App\Http\Requests\UpdateTransaksiKasRequest;
use App\Models\Kategori;
use App\Models\TransaksiKas;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiKasController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim($request->string('search')->toString()),
            'jenis' => trim($request->string('jenis')->toString()),
            'kategori' => trim($request->string('kategori')->toString()),
            'tanggal' => trim($request->string('tanggal')->toString()),
        ];

        $query = TransaksiKas::query()->with('kategori');

        if ($filters['search'] !== '') {
            $search = '%'.$filters['search'].'%';
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('keterangan', 'like', $search)
                    ->orWhereHas('kategori', function ($kategoriQuery) use ($search) {
                        $kategoriQuery->where('nama_kategori', 'like', $search);
                    });
            });
        }

        if ($filters['jenis'] !== '') {
            $query->where('jenis_transaksi', $filters['jenis']);
        }

        if ($filters['kategori'] !== '') {
            $query->where('id_kategori', (int) $filters['kategori']);
        }

        if ($filters['tanggal'] !== '') {
            $query->whereDate('tgl_transaksi', $filters['tanggal']);
        }

        $paginator = $query
            ->orderByDesc('tgl_transaksi')
            ->orderByDesc('id_transaksi')
            ->paginate(10)
            ->withQueryString();

        $items = $paginator->getCollection()->map(function (TransaksiKas $transaksi) {
            return [
                'id_transaksi' => $transaksi->id_transaksi,
                'tgl_transaksi' => optional($transaksi->tgl_transaksi)?->format('d M Y'),
                'tgl_transaksi_form' => optional($transaksi->tgl_transaksi)?->format('Y-m-d'),
                'jenis_transaksi' => $transaksi->jenis_transaksi,
                'id_kategori' => $transaksi->id_kategori,
                'kategori' => $transaksi->kategori?->nama_kategori ?? '-',
                'keterangan' => $transaksi->keterangan,
                'jumlah' => (float) $transaksi->jumlah,
                'jumlah_formatted' => $this->formatCurrency((float) $transaksi->jumlah),
                'is_generated' => $transaksi->id_pembayaran !== null,
            ];
        })->values()->all();

        $today = now();
        $monthStart = $today->copy()->startOfMonth();
        $previousMonthEnd = $monthStart->copy()->subSecond();

        $saldoAwal = (float) TransaksiKas::query()
            ->where('tgl_transaksi', '<=', $previousMonthEnd)
            ->selectRaw("COALESCE(SUM(CASE WHEN jenis_transaksi = 'Masuk' THEN jumlah ELSE -jumlah END), 0) as saldo")
            ->value('saldo');

        $kasMasuk = (float) TransaksiKas::query()
            ->whereBetween('tgl_transaksi', [$monthStart, $today])
            ->where('jenis_transaksi', 'Masuk')
            ->sum('jumlah');

        $kasKeluar = (float) TransaksiKas::query()
            ->whereBetween('tgl_transaksi', [$monthStart, $today])
            ->where('jenis_transaksi', 'Keluar')
            ->sum('jumlah');

        $categories = Kategori::query()
            ->where('is_active', true)
            ->orderBy('tipe')
            ->orderBy('nama_kategori')
            ->get(['id_kategori', 'nama_kategori', 'tipe'])
            ->map(fn (Kategori $kategori) => [
                'id_kategori' => $kategori->id_kategori,
                'nama_kategori' => $kategori->nama_kategori,
                'tipe' => $kategori->tipe,
            ])
            ->values()
            ->all();

        return Inertia::render('TransaksiKas', [
            'transactions' => $items,
            'summary' => [
                ['label' => 'Saldo Awal Bulan', 'value' => $this->formatCurrency($saldoAwal)],
                ['label' => 'Kas Masuk', 'value' => $this->formatCurrency($kasMasuk)],
                ['label' => 'Kas Keluar', 'value' => $this->formatCurrency($kasKeluar)],
            ],
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
            'filters' => $filters,
            'categories' => $categories,
        ]);
    }

    public function store(StoreTransaksiKasRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $kategori = Kategori::query()->findOrFail($validated['id_kategori']);

        if ($kategori->tipe !== $validated['jenis_transaksi']) {
            return redirect()
                ->route('transaksi-kas')
                ->with('error', 'Kategori yang dipilih tidak sesuai dengan jenis transaksi.');
        }

        TransaksiKas::create([
            'id_kategori' => $validated['id_kategori'],
            'id_user' => $request->user()->getKey(),
            'tgl_transaksi' => $validated['tgl_transaksi'],
            'jenis_transaksi' => $validated['jenis_transaksi'],
            'jumlah' => $validated['jumlah'],
            'keterangan' => $validated['keterangan'] ?: null,
        ]);

        return redirect()
            ->route('transaksi-kas')
            ->with('success', 'Transaksi kas berhasil ditambahkan.');
    }

    public function update(UpdateTransaksiKasRequest $request, TransaksiKas $transaksiKa): RedirectResponse
    {
        if ($transaksiKa->id_pembayaran !== null) {
            return redirect()
                ->route('transaksi-kas')
                ->with('error', 'Transaksi yang berasal dari pembayaran iuran tidak dapat diedit dari modul kas.');
        }

        $validated = $request->validated();
        $kategori = Kategori::query()->findOrFail($validated['id_kategori']);

        if ($kategori->tipe !== $validated['jenis_transaksi']) {
            return redirect()
                ->route('transaksi-kas')
                ->with('error', 'Kategori yang dipilih tidak sesuai dengan jenis transaksi.');
        }

        $transaksiKa->update([
            'id_kategori' => $validated['id_kategori'],
            'tgl_transaksi' => $validated['tgl_transaksi'],
            'jenis_transaksi' => $validated['jenis_transaksi'],
            'jumlah' => $validated['jumlah'],
            'keterangan' => $validated['keterangan'] ?: null,
        ]);

        return redirect()
            ->route('transaksi-kas')
            ->with('success', 'Transaksi kas berhasil diperbarui.');
    }

    private function formatCurrency(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }
}