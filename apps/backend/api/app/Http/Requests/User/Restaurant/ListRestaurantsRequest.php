<?php

namespace App\Http\Requests\User\Restaurant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class ListRestaurantsRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'             => ['sometimes', 'string', 'max:255'],
            'category'         => ['sometimes', 'string', 'max:255'],
            'min_rating'       => ['sometimes', 'numeric', 'min:1', 'max:5'],
            'delivery_enabled' => ['sometimes', 'boolean'],
            'pickup_enabled'   => ['sometimes', 'boolean'],
            'accept_orders'    => ['sometimes', 'boolean'],
            'sort_by'          => ['sometimes', 'string', 'in:rating,alphabetical'],
            'per_page'         => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {

        $booleans = ['delivery_enabled', 'pickup_enabled', 'accept_orders'];
        foreach ($booleans as $field) {
            if ($this->has($field)) {
                $this->merge([
                    $field => filter_var($this->input($field), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
                ]);
            }
        }
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
