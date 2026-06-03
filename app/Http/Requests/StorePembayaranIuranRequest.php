<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePembayaranIuranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $tagihanIds = collect($this->input('tagihan_ids', []))
            ->map(fn ($value) => (int) $value)
            ->filter(fn (int $value) => $value > 0)
            ->values()
            ->all();

        $this->merge([
            'payment_scope' => $this->string('payment_scope')->toString() ?: 'resident',
            'id_warga' => $this->filled('id_warga') ? (int) $this->input('id_warga') : null,
            'bulan' => $this->filled('bulan') ? (int) $this->input('bulan') : null,
            'tahun' => $this->filled('tahun') ? (int) $this->input('tahun') : null,
            'id_iuran_wajib' => $this->filled('id_iuran_wajib') ? (int) $this->input('id_iuran_wajib') : null,
            'tagihan_ids' => $tagihanIds,
            'jumlah_bayar' => str_replace([',', 'Rp', ' '], '', $this->string('jumlah_bayar')->toString()),
            'catatan' => trim($this->string('catatan')->toString()),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_scope' => ['required', Rule::in(['resident', 'batch'])],
            'id_warga' => [
                Rule::requiredIf(fn () => $this->input('payment_scope', 'resident') === 'resident'),
                'nullable',
                'integer',
                'exists:warga,id_warga',
            ],
            'bulan' => [
                Rule::requiredIf(fn () => $this->input('payment_scope') === 'batch'),
                'nullable',
                'integer',
                'between:1,12',
            ],
            'tahun' => [
                Rule::requiredIf(fn () => $this->input('payment_scope') === 'batch'),
                'nullable',
                'integer',
                'min:2020',
                'max:2100',
            ],
            'id_iuran_wajib' => ['nullable', 'integer', 'exists:iuran_wajib,id_iuran_wajib'],
            'tagihan_ids' => ['required', 'array', 'min:1'],
            'tagihan_ids.*' => ['integer', 'distinct', 'exists:tagihan_warga,id_tagihan'],
            'metode_bayar' => ['required', Rule::in(['Tunai', 'Transfer Bank', 'QRIS'])],
            'tanggal_bayar' => ['required', 'date'],
            'jumlah_bayar' => ['required', 'numeric', 'min:0'],
            'catatan' => ['nullable', 'string'],
        ];
    }
}
