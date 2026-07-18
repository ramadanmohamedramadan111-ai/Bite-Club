<?php

namespace App\Http\Requests\User\Cart;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class AddItemToCartRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restaurant_id' => 'required|integer|exists:restaurants,id',
            'item_id'       => 'required|integer|exists:items,id',
            'quantity'      => 'required|integer|min:1|max:99',
            'notes'         => 'nullable|string|max:1000',
            'user_id'       => 'required|integer',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_id' => auth('user')->id()
        ]);
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
