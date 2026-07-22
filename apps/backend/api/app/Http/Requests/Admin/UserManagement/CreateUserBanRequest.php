<?php

namespace App\Http\Requests\Admin\UserManagement;

use App\Enums\Auth\UserStatusEnum;
use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class CreateUserBanRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->whereNull('deleted_at'),
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('status', '!=', UserStatusEnum::BANNED->value);
                }),
            ],
            'reason'  => ['required', 'string', 'min:3', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => trans('validation.required', ['attribute' => 'user_id']),
            'user_id.integer'  => trans('validation.integer', ['attribute' => 'user_id']),
            'user_id.exists'   => 'The selected user is invalid or already banned.',
            'reason.required'  => trans('validation.required', ['attribute' => 'reason']),
            'reason.string'    => trans('validation.string', ['attribute' => 'reason']),
            'reason.min'       => trans('validation.min.string', ['attribute' => 'reason', 'min' => 3]),
            'reason.max'       => trans('validation.max.string', ['attribute' => 'reason', 'max' => 1000]),
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
