<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    protected function successResponse(
        ?string $message,
        mixed $data = null,
        int $statusCode = 200
    ): JsonResponse {
        $response = [
            'success' => true,
        ];

        if (!is_null($message)) {
            $response['message'] = $message;
        }

        if (!is_null($data)) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    protected function errorResponse(
        ?string $message,
        mixed $errors = null,
        int $statusCode = 400
    ): JsonResponse {
        $response = [
            'success' => false,
        ];

        if (!is_null($message)) {
            $response['message'] = $message;
        }

        if (!is_null($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    protected function createdResponse(
        ?string $message,
        mixed $data = null
    ): JsonResponse {
        return $this->successResponse($message, $data, 201);
    }

    protected function notFoundResponse(
        ?string $message
    ): JsonResponse {
        return $this->errorResponse($message, null, 404);
    }

    protected function unauthorizedResponse(
        ?string $message
    ): JsonResponse {
        return $this->errorResponse($message, null, 401);
    }

    protected function serverErrorResponse(
        ?string $message
    ): JsonResponse {
        return $this->errorResponse($message, null, 500);
    }
}
