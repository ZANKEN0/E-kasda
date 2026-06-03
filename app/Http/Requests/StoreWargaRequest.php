<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreWargaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nama' => trim($this->string('nama')->toString()),
            'no_rumah' => trim($this->string('no_rumah')->toString()),
            'no_telepon' => trim($this->string('no_telepon')->toString()),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:100'],
            'no_rumah' => ['required', 'string', 'max:100'],
            'no_telepon' => ['nullable', 'string', 'max:20'],
            'status_hunian' => ['required', 'in:Tetap,Kontrak'],
        ];
    }
}