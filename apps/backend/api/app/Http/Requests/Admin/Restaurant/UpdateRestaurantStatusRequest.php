<?php

namespace App\Http\Requests\Admin\Restaurant;

use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateRestaurantStatusRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $data = [
            'id' => $this->route('id'),
        ];

        if ($this->has('status') && is_string($this->input('status'))) {
            $data['status'] = trim(strtolower($this->input('status')));
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        return [
            'id'     => ['required', 'integer', 'exists:restaurants,id'],
            'status' => ['required', 'string', Rule::in(array_map(fn ($case) => $case->value, RestaurantStatusEnum::cases()))],
        ];
    }

    public function messages(): array
    {
        return [
            'id.required'     => trans('validation.required', ['attribute' => 'id']),
            'id.integer'      => trans('validation.integer', ['attribute' => 'id']),
            'id.exists'       => trans('restaurant.not_found'),
            'status.required' => trans('validation.required', ['attribute' => 'status']),
            'status.string'   => trans('validation.string', ['attribute' => 'status']),
            'status.in'       => trans('validation.in', ['attribute' => 'status']),
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
