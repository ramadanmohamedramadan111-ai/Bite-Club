<?php

namespace App\Http\Requests\User\Restaurant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class NearestRestaurantsRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'latitude'  => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }

    public function messages(): array
    {
        return [
            'latitude.required' => trans('validation.required', ['attribute' => 'latitude']),
            'latitude.numeric'  => trans('validation.numeric', ['attribute' => 'latitude']),
            'longitude.required' => trans('validation.required', ['attribute' => 'longitude']),
            'longitude.numeric'  => trans('validation.numeric', ['attribute' => 'longitude']),
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
