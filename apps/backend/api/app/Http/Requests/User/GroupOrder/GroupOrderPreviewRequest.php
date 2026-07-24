<?php

namespace App\Http\Requests\User\GroupOrder;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use App\Enums\Order\OrderTypeEnum;

class GroupOrderPreviewRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_id' => auth('user')->id(),
            'group_order_id' => $this->route('id'),
        ]);
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|integer|exists:users,id',
            'group_order_id' => 'required|integer|exists:group_orders,id',
            'order_type' => ['required', Rule::enum(OrderTypeEnum::class)],
            'lat' => 'nullable|numeric|between:-90,90',
            'long' => 'nullable|numeric|between:-180,180',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
