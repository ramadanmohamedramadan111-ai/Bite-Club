<?php

namespace App\Http\Requests\RestaurantOpeningHour;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class UpdateRestaurantOpeningHoursRequest extends FormRequest
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
            'restaurant_id' => ['required', 'integer'],
            'opening_hours' => ['required', 'array'],
            'opening_hours.*.day_of_week' => ['required', 'integer', 'min:0', 'max:6'],
            'opening_hours.*.is_closed' => ['required', 'boolean'],
            'opening_hours.*.opens_at' => ['required_unless:opening_hours.*.is_closed,true', 'nullable', 'date_format:H:i'],
            'opening_hours.*.closes_at' => ['required_unless:opening_hours.*.is_closed,true', 'nullable', 'date_format:H:i'],
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
