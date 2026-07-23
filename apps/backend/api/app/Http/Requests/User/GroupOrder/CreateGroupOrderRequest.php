<?php

namespace App\Http\Requests\User\GroupOrder;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreateGroupOrderRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'host_id' => auth('user')->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'host_id' => 'required|integer|exists:users,id',
            'group_id' => 'required|integer|exists:groups,id',
            'restaurant_id' => 'required|integer|exists:restaurants,id',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
