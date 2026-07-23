<?php

namespace App\Http\Requests\User\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;
use App\Enums\Order\OrderTypeEnum;

class CheckoutPreviewRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|integer',
            'order_type' => 'required|string|in:' . implode(',', OrderTypeEnum::values()),
            'lat' => 'required_if:order_type,' . OrderTypeEnum::DELIVERY->value . '|numeric|between:-90,90',
            'long' => 'required_if:order_type,' . OrderTypeEnum::DELIVERY->value . '|numeric|between:-180,180',
            'points' => 'sometimes|nullable|integer|min:0',
            'points_redeemed' => 'sometimes|nullable|integer|min:0',
        ];
    }

    protected function prepareForValidation(): void
    {
        $points = $this->input('points') ?? $this->input('points_redeemed');

        $data = [
            'user_id' => auth('user')->id(),
        ];

        if ($points !== null) {
            $data['points'] = (int) $points;
        }

        $this->merge($data);
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
