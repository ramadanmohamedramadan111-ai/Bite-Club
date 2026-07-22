<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('user')->check();
    }

    public function rules(): array
    {
        $userId = auth('user')->id();

        return [
            'first_name'    => ['sometimes', 'string', 'max:255'],
            'last_name'     => ['sometimes', 'string', 'max:255'],
            'username'      => ['sometimes', 'string', 'max:50', 'unique:users,username,' . $userId],
            'profile_image' => ['sometimes', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.unique' => trans('validation.unique', ['attribute' => 'username']),
            'profile_image.image' => 'The profile image must be an image file.',
        ];
    }
}
