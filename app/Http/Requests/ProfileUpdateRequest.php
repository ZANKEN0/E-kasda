<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim($this->string('name')->toString()),
            'email' => Str::lower(trim($this->string('email')->toString())),
            'no_telepon' => trim($this->string('no_telepon')->toString()),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore(
                    $this->user()->getKey(),
                    $this->user()->getKeyName(),
                ),
            ],
            'no_telepon' => ['nullable', 'string', 'max:20'],
        ];
    }
}
