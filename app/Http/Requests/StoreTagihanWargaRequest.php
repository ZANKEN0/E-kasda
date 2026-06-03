<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTagihanWargaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'target_scope' => $this->string('target_scope')->toString() ?: 'single',
            'nominal' => str_replace([',', 'Rp', ' '], '', $this->string('nominal')->toString()),
            'catatan' => trim($this->string('catatan')->toString()),
            // Status lunas hanya boleh dihasilkan lewat modul pembayaran.
            'status_bayar' => 'Belum Lunas',
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'target_scope' => ['required', Rule::in(['single', 'all'])],
            'id_warga' => [
                Rule::requiredIf(fn () => $this->input('target_scope', 'single') === 'single'),
                'nullable',
                'integer',
                'exists:warga,id_warga',
            ],
            'id_iuran_wajib' => ['required', 'integer', 'exists:iuran_wajib,id_iuran_wajib'],
            'bulan' => ['required', 'integer', 'between:1,12'],
            'tahun' => ['required', 'integer', 'min:2020', 'max:2100'],
            'status_bayar' => ['required', Rule::in(['Belum Lunas'])],
            'nominal' => ['required', 'numeric', 'min:0'],
            'tanggal_jatuh_tempo' => ['nullable', 'date'],
            'catatan' => ['nullable', 'string'],
        ];
    }
}
