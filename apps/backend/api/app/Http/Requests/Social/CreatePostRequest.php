<?php

namespace App\Http\Requests\Social;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class CreatePostRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_id' => auth('user')->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'user_id'  => ['required', 'integer', 'exists:users,id'],
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'caption'  => ['required', 'string', 'max:1000'],
            'images'   => ['required', 'array'],
            'images.*' => ['required'],
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
