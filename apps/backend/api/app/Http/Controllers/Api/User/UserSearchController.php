<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\SearchQueryRequest;
use App\DTOs\User\SearchQueryDto;
use App\Http\Resources\User\UserSearchResource;
use App\Services\Application\User\UserApplicationService;

class UserSearchController extends Controller
{
    public function __construct(
        private UserApplicationService $userApplicationService
    ) {}

    public function search(SearchQueryRequest $request): JsonResponse
    {
        try {
            $dto = SearchQueryDto::fromValidatedRequest($request);
            $result = $this->userApplicationService->searchUsers($dto);

            return $this->successResponse(
                'Users retrieved successfully.',
                [
                    'items' => UserSearchResource::collection(collect($result['items'])),
                    'meta'  => $result['meta'],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to search users: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to search users.');
        }
    }
}
