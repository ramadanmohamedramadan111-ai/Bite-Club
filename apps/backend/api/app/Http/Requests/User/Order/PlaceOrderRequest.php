<?php

namespace App\Http\Requests\User\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;
use App\Enums\Order\OrderTypeEnum;
use App\Enums\Payment\PaymentOptionEnum;

class PlaceOrderRequest extends FormRequest
{
    use ApiResponseTrait;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => 'required|integer',
            'order_type' => 'required|string|in:' . implode(',', OrderTypeEnum::values()),
            'payment_option_id' => 'required|string|in:' . implode(',', PaymentOptionEnum::values()),
            'lat' => 'required_if:order_type,' . OrderTypeEnum::DELIVERY->value . '|numeric|between:-90,90',
            'long' => 'required_if:order_type,' . OrderTypeEnum::DELIVERY->value . '|numeric|between:-180,180',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_id' => auth('user')->id(),
        ]);
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
