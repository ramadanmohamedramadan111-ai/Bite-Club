<?php

namespace App\Http\Requests\User\RestaurantCategory;

use Illuminate\Foundation\Http\FormRequest;

class IndexRestaurantCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }
}
