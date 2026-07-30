<?php

namespace App\Http\Requests\Restaurant\Dashboard;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use App\Traits\ApiResponseTrait;

class RestaurantDashboardRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $period = $this->query('period');
        if (is_string($period)) {
            $period = trim(strtolower($period));
        } else {
            $period = 'today';
        }

        $this->merge([
            'period' => $period,
            'restaurant_id' => auth('restaurant')->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'period' => ['required', 'string', Rule::in(['today', 'week', 'month', 'year'])],
            'restaurant_id' => ['required', 'integer'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
