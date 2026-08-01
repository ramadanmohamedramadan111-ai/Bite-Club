<?php

namespace App\Http\Requests\Restaurant\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;
use App\Enums\Payment\PaymentStatusEnum;
use App\Enums\Payment\PaymentMethodEnum;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Support\Facades\Auth;

class ListRestaurantPaymentsRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'restaurant_id' => Auth::guard('restaurant')->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'restaurant_id' => ['required', 'integer'],
            'status' => ['nullable', 'string', new Enum(PaymentStatusEnum::class)],
            'payment_method' => ['nullable', 'string', new Enum(PaymentMethodEnum::class)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
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
