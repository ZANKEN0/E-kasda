<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIuranWajibRequest;
use App\Http\Requests\UpdateIuranWajibRequest;
use App\Models\IuranWajib;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class IuranWajibController extends Controller
{
    public function index(Request $request): Response
    {
        $items = IuranWajib::query()
            ->orderByDesc('is_active')
            ->orderBy('nama_iuran')
            ->get();

        $tagihanCounts = DB::table('tagihan_warga')
            ->selectRaw('id_iuran_wajib, COUNT(*) as total')
            ->groupBy('id_iuran_wajib')
            ->pluck('total', 'id_iuran_wajib');

        $summary = $items->take(4)->map(function (IuranWajib $iuran) {
            return [
                'id_iuran_wajib' => $iuran->id_iuran_wajib,
                'nama_iuran' => $iuran->nama_iuran,
                'nominal_default' => $this->formatCurrency((float) $iuran->nominal_default),
                'periode' => $iuran->periode,
                'is_active' => $iuran->is_active,
            ];
        })->values()->all();

        $rules = $items->map(function (IuranWajib $iuran) use ($tagihanCounts) {
            return [
                'id_iuran_wajib' => $iuran->id_iuran_wajib,
                'nama_iuran' => $iuran->nama_iuran,
                'nominal_default' => (float) $iuran->nominal_default,
                'nominal_default_formatted' => $this->formatCurrency((float) $iuran->nominal_default),
                'periode' => $iuran->periode,
                'jadwal' => $this->resolveSchedule($iuran->periode),
                'keterangan' => $this->resolveDescription($iuran->periode, $iuran->is_active),
                'is_active' => $iuran->is_active,
                'total_tagihan' => (int) ($tagihanCounts[$iuran->id_iuran_wajib] ?? 0),
            ];
        })->values()->all();

        $stats = [
            'total_iuran' => $items->count(),
            'aktif' => $items->where('is_active', true)->count(),
            'nonaktif' => $items->where('is_active', false)->count(),
            'nominal_bulanan' => $this->formatCurrency(
                (float) $items
                    ->where('is_active', true)
                    ->where('periode', 'Bulanan')
                    ->sum(fn (IuranWajib $item) => (float) $item->nominal_default)
            ),
        ];

        return Inertia::render('IuranWajib', [
            'summary' => $summary,
            'billingRules' => $rules,
            'stats' => $stats,
            'periodOptions' => ['Bulanan', 'Tahunan', 'Insidental'],
        ]);
    }

    public function store(StoreIuranWajibRequest $request): RedirectResponse
    {
        IuranWajib::create($request->validated());

        return redirect()
            ->route('iuran-wajib')
            ->with('success', 'Komponen iuran berhasil ditambahkan.');
    }

    public function update(UpdateIuranWajibRequest $request, IuranWajib $iuranWajib): RedirectResponse
    {
        $iuranWajib->update($request->validated());

        return redirect()
            ->route('iuran-wajib')
            ->with('success', 'Komponen iuran berhasil diperbarui.');
    }

    public function destroy(IuranWajib $iuranWajib): RedirectResponse
    {
        if ($iuranWajib->tagihanWarga()->exists()) {
            return redirect()
                ->route('iuran-wajib')
                ->with('error', 'Iuran yang sudah dipakai di tagihan tidak dapat dihapus.');
        }

        $iuranWajib->delete();

        return redirect()
            ->route('iuran-wajib')
            ->with('success', 'Komponen iuran berhasil dihapus.');
    }

    public function toggleStatus(IuranWajib $iuranWajib): RedirectResponse
    {
        $iuranWajib->update([
            'is_active' => ! $iuranWajib->is_active,
        ]);

        return redirect()
            ->route('iuran-wajib')
            ->with('success', 'Status iuran berhasil diperbarui.');
    }

    private function resolveSchedule(string $periode): string
    {
        return match ($periode) {
            'Bulanan' => 'Tanggal 10 setiap bulan',
            'Tahunan' => 'Sekali dalam satu tahun',
            default => 'Sesuai kebutuhan pengurus',
        };
    }

    private function resolveDescription(string $periode, bool $isActive): string
    {
        if (! $isActive) {
            return 'Komponen sedang dinonaktifkan dan tidak dipakai untuk tagihan baru.';
        }

        return match ($periode) {
            'Bulanan' => 'Masuk ke pola tagihan rutin warga setiap bulan.',
            'Tahunan' => 'Digunakan untuk kebutuhan tahunan atau agenda berkala.',
            default => 'Dipakai untuk kebutuhan insidental sesuai keputusan pengurus.',
        };
    }

    private function formatCurrency(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }
}