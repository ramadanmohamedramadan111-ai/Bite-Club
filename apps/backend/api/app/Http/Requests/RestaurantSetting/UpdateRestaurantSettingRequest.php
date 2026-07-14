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
            'id' => $this->route('id'),
        ]);
    }

    public function rules(): array
    {
        return [
            'id'                 => ['required', 'integer', 'exists:restaurant_settings,id'],
            'deposit_threshold'  => ['sometimes', 'required', 'numeric', 'min:250'],
            'deposit_percentage' => ['sometimes', 'required', 'numeric', 'min:30', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'id.required'                 => trans('validation.required', ['attribute' => 'id']),
            'id.integer'                  => trans('validation.integer', ['attribute' => 'id']),
            'id.exists'                   => trans('restaurant_setting.not_found'),
            'deposit_threshold.required'  => trans('validation.required', ['attribute' => 'deposit_threshold']),
            'deposit_threshold.numeric'   => trans('validation.numeric', ['attribute' => 'deposit_threshold']),
            'deposit_threshold.min'       => trans('validation.min.numeric', ['attribute' => 'deposit_threshold', 'min' => 250]),
            'deposit_percentage.required' => trans('validation.required', ['attribute' => 'deposit_percentage']),
            'deposit_percentage.numeric'  => trans('validation.numeric', ['attribute' => 'deposit_percentage']),
            'deposit_percentage.min'      => trans('validation.min.numeric', ['attribute' => 'deposit_percentage', 'min' => 30]),
            'deposit_percentage.max'      => trans('validation.max.numeric', ['attribute' => 'deposit_percentage', 'max' => 100]),
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
