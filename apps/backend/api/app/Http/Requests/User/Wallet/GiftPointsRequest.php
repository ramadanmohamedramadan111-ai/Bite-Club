<?php

namespace App\Http\Requests\User\Wallet;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class GiftPointsRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receiver_id' => ['required', 'integer', 'exists:users,id'],
            'points'      => ['required', 'integer', 'min:10'],
            'note'        => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_id.required' => trans('validation.required', ['attribute' => 'receiver_id']),
            'receiver_id.integer'  => trans('validation.integer', ['attribute' => 'receiver_id']),
            'receiver_id.exists'   => trans('validation.exists', ['attribute' => 'receiver_id']),
            'points.required'      => trans('validation.required', ['attribute' => 'points']),
            'points.integer'       => trans('validation.integer', ['attribute' => 'points']),
            'points.min'           => trans('validation.min.numeric', ['attribute' => 'points', 'min' => 10]) ?? 'The points must be at least 10.',
            'note.string'          => trans('validation.string', ['attribute' => 'note']),
            'note.max'             => trans('validation.max.string', ['attribute' => 'note', 'max' => 255]) ?? 'The note may not be greater than 255 characters.',
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
