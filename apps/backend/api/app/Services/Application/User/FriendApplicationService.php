<?php

namespace App\Services\Application\User;

use App\DTOs\User\SearchQueryDto;
use App\DTOs\User\Friend\SendFriendRequestDto;
use App\DTOs\User\Friend\AcceptFriendRequestDto;
use App\DTOs\User\Friend\RejectFriendRequestDto;
use App\DTOs\User\Friend\CancelFriendRequestDto;
use App\DTOs\User\Friend\RemoveFriendshipDto;
use App\Services\Domain\User\FriendDomainService;

class FriendApplicationService
{
    public function __construct(
        private FriendDomainService $friendDomainService
    ) {}

    public function sendRequest(SendFriendRequestDto $dto): array
    {
        $request = $this->friendDomainService->sendRequest($dto->getUserId());
        return [
            'id'           => $request->id,
            'requester_id' => $request->requester_id,
            'addressee_id' => $request->addressee_id,
            'status'       => $request->status,
            'created_at'   => $request->created_at ? $request->created_at->toIso8601String() : null,
        ];
    }

    public function listPendingRequests(SearchQueryDto $dto): array
    {
        $paginator = $this->friendDomainService->listPendingRequests($dto->getSearch(), $dto->getPerPage());
        return [
            'items' => $paginator->items(),
            'meta'  => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ];
    }

    public function listSentRequests(SearchQueryDto $dto): array
    {
        $paginator = $this->friendDomainService->listSentRequests($dto->getSearch(), $dto->getPerPage());
        return [
            'items' => $paginator->items(),
            'meta'  => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ];
    }

    public function acceptRequest(AcceptFriendRequestDto $dto): array
    {
        $friendship = $this->friendDomainService->acceptRequest($dto->getId());
        return [
            'id'                => $friendship->id,
            'user_low_id'       => $friendship->user_low_id,
            'user_high_id'      => $friendship->user_high_id,
            'source_request_id' => $friendship->source_request_id,
            'created_at'        => $friendship->created_at ? $friendship->created_at->toIso8601String() : null,
        ];
    }

    public function rejectRequest(RejectFriendRequestDto $dto): array
    {
        $request = $this->friendDomainService->rejectRequest($dto->getId());
        return [
            'id'           => $request->id,
            'requester_id' => $request->requester_id,
            'addressee_id' => $request->addressee_id,
            'status'       => $request->status,
            'responded_at' => $request->responded_at ? $request->responded_at->toIso8601String() : null,
        ];
    }

    public function cancelRequest(CancelFriendRequestDto $dto): void
    {
        $this->friendDomainService->cancelRequest($dto->getId());
    }

    public function listFriends(SearchQueryDto $dto): array
    {
        $paginator = $this->friendDomainService->listFriends($dto->getSearch(), $dto->getPerPage());
        return [
            'items' => $paginator->items(),
            'meta'  => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ];
    }

    public function removeFriendship(RemoveFriendshipDto $dto): void
    {
        $this->friendDomainService->removeFriendship($dto->getUserId());
    }
}
