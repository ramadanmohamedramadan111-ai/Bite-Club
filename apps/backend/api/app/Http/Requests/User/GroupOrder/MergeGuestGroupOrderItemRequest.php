<?php

namespace App\Http\Requests\User\GroupOrder;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class MergeGuestGroupOrderItemRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'group_order_id' => $this->route('id'),
        ]);
    }

    public function rules(): array
    {
        return [
            'guest_user_id' => 'required|string|max:255',
            'group_order_id' => 'required|integer|exists:group_orders,id',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
