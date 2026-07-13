<?php

namespace App\Http\Requests\RestaurantSetting;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class StoreRestaurantSettingRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restaurant_id'      => ['required', 'integer', 'exists:restaurants,id', 'unique:restaurant_settings,restaurant_id'],
            'commission_rate'    => ['required', 'numeric', 'min:0'],
            'deposit_threshold'  => ['required', 'numeric', 'min:0'],
            'deposit_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'service_fee_amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'restaurant_id.required'      => trans('validation.required', ['attribute' => 'restaurant_id']),
            'restaurant_id.integer'       => trans('validation.integer', ['attribute' => 'restaurant_id']),
            'restaurant_id.exists'        => trans('validation.exists', ['attribute' => 'restaurant_id']),
            'restaurant_id.unique'        => trans('validation.unique', ['attribute' => 'restaurant_id']),
            'commission_rate.required'    => trans('validation.required', ['attribute' => 'commission_rate']),
            'commission_rate.numeric'     => trans('validation.numeric', ['attribute' => 'commission_rate']),
            'commission_rate.min'         => trans('validation.min.numeric', ['attribute' => 'commission_rate', 'min' => 0]),
            'deposit_threshold.required'  => trans('validation.required', ['attribute' => 'deposit_threshold']),
            'deposit_threshold.numeric'   => trans('validation.numeric', ['attribute' => 'deposit_threshold']),
            'deposit_threshold.min'       => trans('validation.min.numeric', ['attribute' => 'deposit_threshold', 'min' => 0]),
            'deposit_percentage.required' => trans('validation.required', ['attribute' => 'deposit_percentage']),
            'deposit_percentage.numeric'  => trans('validation.numeric', ['attribute' => 'deposit_percentage']),
            'deposit_percentage.min'      => trans('validation.min.numeric', ['attribute' => 'deposit_percentage', 'min' => 0]),
            'deposit_percentage.max'      => trans('validation.max.numeric', ['attribute' => 'deposit_percentage', 'max' => 100]),
            'service_fee_amount.required' => trans('validation.required', ['attribute' => 'service_fee_amount']),
            'service_fee_amount.numeric'  => trans('validation.numeric', ['attribute' => 'service_fee_amount']),
            'service_fee_amount.min'      => trans('validation.min.numeric', ['attribute' => 'service_fee_amount', 'min' => 0]),
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
