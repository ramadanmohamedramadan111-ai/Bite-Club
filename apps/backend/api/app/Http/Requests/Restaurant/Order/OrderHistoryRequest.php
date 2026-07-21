<?php

namespace App\Http\Requests\Restaurant\Order;

use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\Enum;

class OrderHistoryRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'restaurant_id' => auth('restaurant')->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'restaurant_id' => 'required|integer',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'status' => ['nullable', 'string', new Enum(OrderStatusEnum::class)],
            'order_type' => ['nullable', 'string', new Enum(OrderTypeEnum::class)],
            'from_date' => 'nullable|date|before_or_equal:today',
            'to_date' => 'nullable|date|after_or_equal:from_date|before_or_equal:today',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
