<?php

namespace App\Http\Requests\GeneralSetting;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class UpdateGeneralSettingRequest extends FormRequest
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
            'id'                 => ['required', 'integer', 'exists:general_settings,id'],
            'commission_rate'    => ['sometimes', 'required', 'numeric', 'min:1', 'max:100'],
            'service_fee_amount' => ['sometimes', 'required', 'numeric', 'min:0', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'id.required'                 => trans('validation.required', ['attribute' => 'id']),
            'id.integer'                  => trans('validation.integer', ['attribute' => 'id']),
            'id.exists'                   => trans('general_setting.not_found'),
            'commission_rate.required'    => trans('validation.required', ['attribute' => 'commission_rate']),
            'commission_rate.numeric'     => trans('validation.numeric', ['attribute' => 'commission_rate']),
            'commission_rate.min'         => trans('validation.min.numeric', ['attribute' => 'commission_rate', 'min' => 1]),
            'commission_rate.max'         => trans('validation.max.numeric', ['attribute' => 'commission_rate', 'max' => 100]),
            'service_fee_amount.required' => trans('validation.required', ['attribute' => 'service_fee_amount']),
            'service_fee_amount.numeric'  => trans('validation.numeric', ['attribute' => 'service_fee_amount']),
            'service_fee_amount.min'      => trans('validation.min.numeric', ['attribute' => 'service_fee_amount', 'min' => 0]),
            'service_fee_amount.max'      => trans('validation.max.numeric', ['attribute' => 'service_fee_amount', 'max' => 20]),
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
