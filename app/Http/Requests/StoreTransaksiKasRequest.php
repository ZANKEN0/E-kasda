<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransaksiKasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'id_kategori' => (int) $this->input('id_kategori'),
            'jumlah' => str_replace([',', 'Rp', ' '], '', $this->string('jumlah')->toString()),
            'keterangan' => trim($this->string('keterangan')->toString()),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tgl_transaksi' => ['required', 'date'],
            'jenis_transaksi' => ['required', Rule::in(['Masuk', 'Keluar'])],
            'id_kategori' => ['required', 'integer', 'exists:kategori,id_kategori'],
            'jumlah' => ['required', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string'],
        ];
    }
}