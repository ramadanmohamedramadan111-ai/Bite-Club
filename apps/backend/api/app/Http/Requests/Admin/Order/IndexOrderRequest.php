<?php

namespace App\Http\Requests\Admin\Order;

use App\Enums\Order\OrderStatusEnum;
use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class IndexOrderRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('search') && is_string($this->input('search'))) {
            $data['search'] = trim($this->input('search'));
        }

        if ($this->has('status') && is_string($this->input('status'))) {
            $data['status'] = trim(strtolower($this->input('status')));
        }

        if ($this->has('period') && is_string($this->input('period'))) {
            $data['period'] = trim(strtolower($this->input('period')));
        }

        if ($this->has('from') && is_string($this->input('from'))) {
            $data['from'] = trim($this->input('from'));
        }

        if ($this->has('to') && is_string($this->input('to'))) {
            $data['to'] = trim($this->input('to'));
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        return [
            'search'        => ['sometimes', 'nullable', 'string', 'max:255'],
            'status'        => ['sometimes', 'nullable', 'string', Rule::in(OrderStatusEnum::values())],
            'restaurant_id' => ['sometimes', 'nullable', 'integer', 'exists:restaurants,id'],
            'period'        => ['sometimes', 'nullable', 'string', Rule::in(['today', 'week', 'month'])],
            'from'          => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'to'            => ['sometimes', 'nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'page'          => ['sometimes', 'nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'search.string'        => trans('validation.string', ['attribute' => 'search']),
            'search.max'           => trans('validation.max.string', ['attribute' => 'search', 'max' => 255]),
            'status.in'            => trans('validation.in', ['attribute' => 'status']),
            'restaurant_id.integer'=> trans('validation.integer', ['attribute' => 'restaurant_id']),
            'restaurant_id.exists' => trans('validation.exists', ['attribute' => 'restaurant_id']),
            'period.in'            => trans('validation.in', ['attribute' => 'period']),
            'from.date_format'     => trans('validation.date_format', ['attribute' => 'from', 'format' => 'Y-m-d']),
            'to.date_format'       => trans('validation.date_format', ['attribute' => 'to', 'format' => 'Y-m-d']),
            'to.after_or_equal'    => trans('validation.after_or_equal', ['attribute' => 'to', 'date' => 'from']),
            'page.integer'         => trans('validation.integer', ['attribute' => 'page']),
            'page.min'             => trans('validation.min.numeric', ['attribute' => 'page', 'min' => 1]),
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
