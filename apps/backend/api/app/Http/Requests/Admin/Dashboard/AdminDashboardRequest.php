<?php

namespace App\Http\Requests\Admin\Dashboard;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AdminDashboardRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $period = $this->input('period');
        if (is_string($period)) {
            $period = trim(strtolower($period));
        } else {
            $period = 'month';
        }

        $this->merge([
            'period' => $period,
        ]);
    }

    public function rules(): array
    {
        return [
            'period' => ['sometimes', 'string', Rule::in(['today', 'week', 'month', 'year', 'all'])],
        ];
    }

    public function messages(): array
    {
        return [
            'period.string' => trans('validation.string', ['attribute' => 'period']),
            'period.in'     => trans('validation.in', ['attribute' => 'period']),
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
