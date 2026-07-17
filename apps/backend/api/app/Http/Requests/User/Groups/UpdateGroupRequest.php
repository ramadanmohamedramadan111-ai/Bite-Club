<?php

namespace App\Http\Requests\User\Groups;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class UpdateGroupRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'               => ['nullable', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'image'              => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'allow_join_by_link' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => trans('validation.string', ['attribute' => 'name']),
            'name.max'    => trans('validation.max.string', ['attribute' => 'name', 'max' => 255]),
            'image.image' => trans('validation.image', ['attribute' => 'image']),
            'image.mimes' => trans('validation.mimes', ['attribute' => 'image', 'values' => 'jpeg,png,jpg,gif,svg']),
            'image.max'   => trans('validation.max.file', ['attribute' => 'image', 'max' => 2048]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(
                null,
                $validator->errors(),
                422
            )
        );
    }
}
