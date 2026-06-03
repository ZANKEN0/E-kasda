<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreIuranWajibRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nama_iuran' => trim($this->string('nama_iuran')->toString()),
            'periode' => trim($this->string('periode')->toString()),
            'nominal_default' => str_replace([',', 'Rp', ' '], '', $this->string('nominal_default')->toString()),
            'is_active' => $this->boolean('is_active'),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama_iuran' => ['required', 'string', 'max:50'],
            'nominal_default' => ['required', 'numeric', 'min:0'],
            'periode' => ['required', 'in:Bulanan,Tahunan,Insidental'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}