<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Requests\User\Friend\SendFriendRequest;
use App\Http\Requests\User\Friend\AcceptFriendRequest;
use App\Http\Requests\User\Friend\RejectFriendRequest;
use App\Http\Requests\User\Friend\CancelFriendRequest;
use App\Http\Requests\User\Friend\RemoveFriendship;
use App\DTOs\User\Friend\SendFriendRequestDto;
use App\DTOs\User\Friend\AcceptFriendRequestDto;
use App\DTOs\User\Friend\RejectFriendRequestDto;
use App\DTOs\User\Friend\CancelFriendRequestDto;
use App\DTOs\User\Friend\RemoveFriendshipDto;
use App\Http\Resources\User\Friend\FriendRequestResource;
use App\Http\Resources\User\Friend\FriendResource;
use App\Http\Resources\User\Friend\SentFriendRequestResource;
use App\Http\Requests\User\SearchQueryRequest;
use App\DTOs\User\SearchQueryDto;
use App\Services\Application\User\FriendApplicationService;

class FriendController extends Controller
{
    public function __construct(
        private FriendApplicationService $friendApplicationService
    ) {}

    public function sendRequest(SendFriendRequest $request): JsonResponse
    {
        try {
            $dto = SendFriendRequestDto::fromValidatedRequest($request);
            $result = $this->friendApplicationService->sendRequest($dto);

            return $this->successResponse(
                'Friend request sent successfully.',
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to send friend request: ' . $e->getMessage());
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to send friend request.');
        }
    }

    public function listRequests(SearchQueryRequest $request): JsonResponse
    {
        try {
            $dto = SearchQueryDto::fromValidatedRequest($request);
            $result = $this->friendApplicationService->listPendingRequests($dto);

            return $this->successResponse(
                'Pending friend requests retrieved successfully.',
                [
                    'items' => FriendRequestResource::collection(collect($result['items'])),
                    'meta'  => $result['meta'],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve pending friend requests: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve pending friend requests.');
        }
    }

    public function listSentRequests(SearchQueryRequest $request): JsonResponse
    {
        try {
            $dto = SearchQueryDto::fromValidatedRequest($request);
            $result = $this->friendApplicationService->listSentRequests($dto);

            return $this->successResponse(
                'Sent friend requests retrieved successfully.',
                [
                    'items' => SentFriendRequestResource::collection(collect($result['items'])),
                    'meta'  => $result['meta'],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve sent friend requests: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve sent friend requests.');
        }
    }

    public function acceptRequest(AcceptFriendRequest $request): JsonResponse
    {
        try {
            $dto = AcceptFriendRequestDto::fromValidatedRequest($request);
            $result = $this->friendApplicationService->acceptRequest($dto);

            return $this->successResponse(
                'Friend request accepted successfully.',
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Friend request not found.');
        } catch (Exception $e) {
            Log::error('Failed to accept friend request: ' . $e->getMessage(), ['id' => $request->route('request')]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to accept friend request.');
        }
    }

    public function rejectRequest(RejectFriendRequest $request): JsonResponse
    {
        try {
            $dto = RejectFriendRequestDto::fromValidatedRequest($request);
            $result = $this->friendApplicationService->rejectRequest($dto);

            return $this->successResponse(
                'Friend request rejected successfully.',
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Friend request not found.');
        } catch (Exception $e) {
            Log::error('Failed to reject friend request: ' . $e->getMessage(), ['id' => $request->route('request')]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to reject friend request.');
        }
    }

    public function cancelRequest(CancelFriendRequest $request): JsonResponse
    {
        try {
            $dto = CancelFriendRequestDto::fromValidatedRequest($request);
            $this->friendApplicationService->cancelRequest($dto);

            return $this->successResponse(
                'Friend request cancelled successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Friend request not found.');
        } catch (Exception $e) {
            Log::error('Failed to cancel friend request: ' . $e->getMessage(), ['id' => $request->route('request')]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to cancel friend request.');
        }
    }

    public function listFriends(SearchQueryRequest $request): JsonResponse
    {
        try {
            $dto = SearchQueryDto::fromValidatedRequest($request);
            $result = $this->friendApplicationService->listFriends($dto);

            return $this->successResponse(
                'Friends retrieved successfully.',
                [
                    'items' => FriendResource::collection(collect($result['items'])),
                    'meta'  => $result['meta'],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve friends: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve friends.');
        }
    }

    public function removeFriendship(RemoveFriendship $request): JsonResponse
    {
        try {
            $dto = RemoveFriendshipDto::fromValidatedRequest($request);
            $this->friendApplicationService->removeFriendship($dto);

            return $this->successResponse(
                'Friendship removed successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('User not found.');
        } catch (Exception $e) {
            Log::error('Failed to remove friendship: ' . $e->getMessage(), ['user_id' => $request->route('user')]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to remove friendship.');
        }
    }
}
