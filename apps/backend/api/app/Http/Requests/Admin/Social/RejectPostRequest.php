<?php

namespace App\Http\Requests\Admin\Social;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class RejectPostRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'post_id'  => $this->route('postId') ?? $this->route('post'),
            'admin_id' => auth('admin')->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'post_id'          => ['required', 'integer', 'exists:posts,id'],
            'admin_id'         => ['required', 'integer'],
            'rejection_reason' => ['required', 'string', 'max:1000'],
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
