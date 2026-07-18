<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Requests\User\Groups\StoreGroupRequest;
use App\Http\Requests\User\Groups\UpdateGroupRequest;
use App\Http\Requests\User\Groups\UpdateJoinSettingsRequest;
use App\Http\Requests\User\Groups\AddMemberRequest;
use App\Http\Requests\User\Groups\UpdateMemberRoleRequest;
use App\Http\Requests\User\SearchQueryRequest;
use App\DTOs\User\Groups\StoreGroupDto;
use App\DTOs\User\Groups\UpdateGroupDto;
use App\DTOs\User\Groups\UpdateJoinSettingsDto;
use App\DTOs\User\Groups\AddMemberDto;
use App\DTOs\User\Groups\UpdateMemberRoleDto;
use App\DTOs\User\SearchQueryDto;
use App\Http\Resources\User\Groups\GroupResource;
use App\Http\Resources\User\Groups\GroupDetailResource;
use App\Http\Resources\User\Groups\GroupMemberResource;
use App\Http\Resources\User\Friend\FriendResource;
use App\Services\Application\User\GroupApplicationService;

class GroupController extends Controller
{
    public function __construct(
        private GroupApplicationService $groupApplicationService
    ) {}

    public function store(StoreGroupRequest $request): JsonResponse
    {
        try {
            $dto = StoreGroupDto::fromValidatedRequest($request);
            $group = $this->groupApplicationService->createGroup($dto);

            return $this->successResponse(
                'Group created successfully.',
                new GroupDetailResource($group),
                201
            );
        } catch (Exception $e) {
            Log::error('Failed to create group: ' . $e->getMessage());
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to create group.');
        }
    }

    public function index(SearchQueryRequest $request): JsonResponse
    {
        try {
            $dto = SearchQueryDto::fromValidatedRequest($request);
            $paginator = $this->groupApplicationService->listGroups($dto->getSearch(), $dto->getPerPage(), $dto->getStatus());

            return $this->successResponse(
                'Groups retrieved successfully.',
                [
                    'items' => GroupResource::collection($paginator->getCollection()),
                    'meta'  => [
                        'current_page' => $paginator->currentPage(),
                        'last_page'    => $paginator->lastPage(),
                        'per_page'     => $paginator->perPage(),
                        'total'        => $paginator->total(),
                    ]
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve groups: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve groups.');
        }
    }

    public function show(int $group): JsonResponse
    {
        try {
            $result = $this->groupApplicationService->getGroup($group);

            return $this->successResponse(
                'Group details retrieved successfully.',
                new GroupDetailResource($result)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group not found.');
        } catch (Exception $e) {
            Log::error('Failed to retrieve group details: ' . $e->getMessage(), ['group_id' => $group]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to retrieve group details.');
        }
    }

    public function update(UpdateGroupRequest $request, int $group): JsonResponse
    {
        try {
            $dto = UpdateGroupDto::fromValidatedRequest($request);
            $result = $this->groupApplicationService->updateGroup($group, $dto);

            return $this->successResponse(
                'Group updated successfully.',
                new GroupDetailResource($result)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group not found.');
        } catch (Exception $e) {
            Log::error('Failed to update group: ' . $e->getMessage(), ['group_id' => $group]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to update group.');
        }
    }

    public function destroy(int $group): JsonResponse
    {
        try {
            $result = $this->groupApplicationService->archiveGroup($group);

            return $this->successResponse(
                'Group archived successfully.',
                new GroupDetailResource($result)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group not found.');
        } catch (Exception $e) {
            Log::error('Failed to archive group: ' . $e->getMessage(), ['group_id' => $group]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to archive group.');
        }
    }

    public function listMembers(SearchQueryRequest $request, int $group): JsonResponse
    {
        try {
            $dto = SearchQueryDto::fromValidatedRequest($request);
            $paginator = $this->groupApplicationService->listMembers($group, $dto->getSearch(), $dto->getPerPage());

            return $this->successResponse(
                'Group members retrieved successfully.',
                [
                    'items' => GroupMemberResource::collection($paginator->getCollection()),
                    'meta'  => [
                        'current_page' => $paginator->currentPage(),
                        'last_page'    => $paginator->lastPage(),
                        'per_page'     => $paginator->perPage(),
                        'total'        => $paginator->total(),
                    ]
                ]
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group not found.');
        } catch (Exception $e) {
            Log::error('Failed to retrieve group members: ' . $e->getMessage(), ['group_id' => $group]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to retrieve group members.');
        }
    }

    public function listInvitableFriends(SearchQueryRequest $request, int $group): JsonResponse
    {
        try {
            $dto = SearchQueryDto::fromValidatedRequest($request);
            $paginator = $this->groupApplicationService->listInvitableFriends($group, $dto->getSearch(), $dto->getPerPage());

            return $this->successResponse(
                'Invitable friends retrieved successfully.',
                [
                    'items' => FriendResource::collection($paginator->getCollection()),
                    'meta'  => [
                        'current_page' => $paginator->currentPage(),
                        'last_page'    => $paginator->lastPage(),
                        'per_page'     => $paginator->perPage(),
                        'total'        => $paginator->total(),
                    ]
                ]
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group not found.');
        } catch (Exception $e) {
            Log::error('Failed to retrieve invitable friends: ' . $e->getMessage(), ['group_id' => $group]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to retrieve invitable friends.');
        }
    }

    public function addMember(AddMemberRequest $request, int $group): JsonResponse
    {
        try {
            $dto = AddMemberDto::fromValidatedRequest($request);
            $this->groupApplicationService->addMember($group, $dto);

            return $this->successResponse(
                'Member added successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group or user not found.');
        } catch (Exception $e) {
            Log::error('Failed to add member to group: ' . $e->getMessage(), ['group_id' => $group]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to add member to group.');
        }
    }

    public function removeMember(int $group, int $user): JsonResponse
    {
        try {
            $this->groupApplicationService->removeMember($group, $user);

            return $this->successResponse(
                'Member removed successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group or member not found.');
        } catch (Exception $e) {
            Log::error('Failed to remove member from group: ' . $e->getMessage(), ['group_id' => $group, 'user_id' => $user]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to remove member from group.');
        }
    }

    public function updateMemberRole(UpdateMemberRoleRequest $request, int $group, int $user): JsonResponse
    {
        try {
            $dto = UpdateMemberRoleDto::fromValidatedRequest($request);
            $this->groupApplicationService->updateMemberRole($group, $user, $dto);

            return $this->successResponse(
                'Member role updated successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group or member not found.');
        } catch (Exception $e) {
            Log::error('Failed to update member role in group: ' . $e->getMessage(), ['group_id' => $group, 'user_id' => $user]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to update member role.');
        }
    }

    public function leave(int $group): JsonResponse
    {
        try {
            $this->groupApplicationService->leaveGroup($group);

            return $this->successResponse(
                'Left group successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group not found.');
        } catch (Exception $e) {
            Log::error('Failed to leave group: ' . $e->getMessage(), ['group_id' => $group]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to leave group.');
        }
    }

    public function showInvite(string $token): JsonResponse
    {
        try {
            $group = $this->groupApplicationService->showInvite($token);

            return $this->successResponse(
                'Invite token is valid.',
                new GroupResource($group)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Invite token not found.');
        } catch (Exception $e) {
            Log::error('Failed to validate group invite: ' . $e->getMessage(), ['token' => $token]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to validate group invite.');
        }
    }

    public function joinByInvite(string $token): JsonResponse
    {
        try {
            $group = $this->groupApplicationService->joinByInvite($token);

            return $this->successResponse(
                'Joined group successfully.',
                new GroupDetailResource($group)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Invite token not found.');
        } catch (Exception $e) {
            Log::error('Failed to join group via invite: ' . $e->getMessage(), ['token' => $token]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to join group via invite.');
        }
    }

    public function updateJoinSettings(UpdateJoinSettingsRequest $request, int $group): JsonResponse
    {
        try {
            $dto = UpdateJoinSettingsDto::fromValidatedRequest($request);
            $result = $this->groupApplicationService->updateJoinSettings($group, $dto);

            return $this->successResponse(
                'Join settings updated successfully.',
                new GroupDetailResource($result)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group not found.');
        } catch (Exception $e) {
            Log::error('Failed to update group join settings: ' . $e->getMessage(), ['group_id' => $group]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to update group join settings.');
        }
    }

    public function regenerateInviteToken(int $group): JsonResponse
    {
        try {
            $result = $this->groupApplicationService->regenerateInviteToken($group);

            return $this->successResponse(
                'Invite link regenerated successfully.',
                [
                    'invite_token' => $result->invite_token,
                ]
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Group not found.');
        } catch (Exception $e) {
            Log::error('Failed to regenerate group invite token: ' . $e->getMessage(), ['group_id' => $group]);
            return $this->serverErrorResponse($e->getMessage() ?: 'Failed to regenerate group invite token.');
        }
    }
}
