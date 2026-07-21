<?php

namespace App\Http\Requests\Social;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class CopyOrderRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'post_id' => $this->route('postId') ?? $this->route('post'),
            'user_id' => auth('user')->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'post_id' => ['required', 'integer', 'exists:posts,id'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
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
