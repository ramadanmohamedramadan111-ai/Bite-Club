<?php

namespace App\Http\Requests\User\GroupOrder;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RemoveGroupOrderItemRequest extends FormRequest
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
            'group_order_id' => $this->route('id'),
            'group_order_item_id' => $this->route('itemId'),
        ]);
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|integer|exists:users,id',
            'group_order_id' => 'required|integer|exists:group_orders,id',
            'group_order_item_id' => 'required|integer|exists:group_order_items,id',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
