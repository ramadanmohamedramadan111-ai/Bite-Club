<?php

namespace App\Http\Requests\Restaurant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class UpdateRestaurantProfileRequest extends FormRequest
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
        $restaurantId = auth('restaurant')->id();

        return [
            'restaurant_id' => ['required', 'integer'],
            'name'          => ['sometimes', 'string', 'max:255'],
            'description'   => ['sometimes', 'nullable', 'string', 'max:1000'],
            'phone_number'  => ['sometimes', 'string', 'max:20', 'unique:restaurants,phone_number,' . $restaurantId],
            'address'       => ['sometimes', 'string', 'max:500'],
            'category_id'   => ['sometimes', 'nullable', 'integer', 'exists:restaurant_categories,id'],
            'logo'          => ['sometimes', 'nullable', 'image', 'max:2048'],
            'cover_image'   => ['sometimes', 'nullable', 'image', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone_number.unique' => trans('restaurant_auth.phone_taken'),
            'category_id.exists'   => trans('validation.exists', ['attribute' => 'category']),
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
