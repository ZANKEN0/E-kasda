<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ImportWargaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $rows = collect($this->input('rows', []))
            ->map(function ($row) {
                return [
                    'nama' => trim((string) ($row['nama'] ?? '')),
                    'no_rumah' => trim((string) ($row['no_rumah'] ?? '')),
                    'no_telepon' => trim((string) ($row['no_telepon'] ?? '')),
                    'status_hunian' => trim((string) ($row['status_hunian'] ?? '')),
                ];
            })
            ->values()
            ->all();

        $this->merge([
            'rows' => $rows,
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rows' => ['required', 'array', 'min:1', 'max:500'],
            'rows.*.nama' => ['required', 'string', 'max:100'],
            'rows.*.no_rumah' => ['required', 'string', 'max:100'],
            'rows.*.no_telepon' => ['nullable', 'string', 'max:20'],
            'rows.*.status_hunian' => ['required', 'in:Tetap,Kontrak'],
        ];
    }

    public function messages(): array
    {
        return [
            'rows.required' => 'Belum ada data warga yang siap diimpor.',
            'rows.array' => 'Format data impor warga tidak valid.',
            'rows.min' => 'Belum ada data warga yang siap diimpor.',
            'rows.max' => 'Jumlah data impor maksimal 500 baris per proses.',
        ];
    }
}
