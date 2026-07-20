<?php

namespace App\Http\Requests\RestaurantSetting;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class UpdateRestaurantSettingRequest extends FormRequest
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
            'restaurant_id'       => ['required', 'integer'],
            'is_open'             => ['sometimes', 'boolean'],
            'accept_orders'       => ['sometimes', 'boolean'],
            'delivery_enabled'    => ['sometimes', 'boolean'],
            'pickup_enabled'      => ['sometimes', 'boolean'],
            'latitude'            => ['sometimes', 'numeric'],
            'longitude'           => ['sometimes', 'numeric'],
            'delivery_radius'     => ['sometimes', 'numeric', 'min:0'],
            'delivery_fee_per_km' => ['sometimes', 'numeric', 'min:0'],
            'deposit_threshold'   => ['sometimes', 'numeric', 'min:0'],
            'deposit_percentage'  => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'min_price_order'     => ['sometimes', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'deposit_threshold.numeric'   => trans('validation.numeric', ['attribute' => 'deposit_threshold']),
            'deposit_threshold.min'       => trans('validation.min.numeric', ['attribute' => 'deposit_threshold', 'min' => 0]),
            'deposit_percentage.numeric'  => trans('validation.numeric', ['attribute' => 'deposit_percentage']),
            'deposit_percentage.min'      => trans('validation.min.numeric', ['attribute' => 'deposit_percentage', 'min' => 0]),
            'deposit_percentage.max'      => trans('validation.max.numeric', ['attribute' => 'deposit_percentage', 'max' => 100]),
            'min_price_order.numeric'     => trans('validation.numeric', ['attribute' => 'min_price_order']),
            'min_price_order.min'         => trans('validation.min.numeric', ['attribute' => 'min_price_order', 'min' => 0]),
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
