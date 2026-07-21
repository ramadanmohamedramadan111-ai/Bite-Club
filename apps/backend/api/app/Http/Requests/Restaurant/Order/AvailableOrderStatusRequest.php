<?php

namespace App\Http\Requests\Restaurant\Order;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AvailableOrderStatusRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'order_id' => $this->route('orderId'),
            'restaurant_id' => auth('restaurant')->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'order_id' => [
                'required', 
                'integer',
                Rule::exists('orders', 'id')->where(function ($query) {
                    return $query->where('restaurant_id', $this->restaurant_id);
                }),
            ],
            'restaurant_id' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'order_id.exists' => trans('order.not_found') ?? 'Order not found.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
