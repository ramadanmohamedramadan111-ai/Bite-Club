<?php

namespace App\Services\Domain\User;

use Exception;
use App\Models\User;
use App\Models\FriendRequest;
use App\Models\Friendship;
use App\Enums\User\FriendRequestStatusEnum;
use App\Repositories\Interfaces\User\FriendRequestRepositoryInterface;
use App\Repositories\Interfaces\User\FriendshipRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FriendDomainService
{
    public function __construct(
        private FriendRequestRepositoryInterface $friendRequestRepository,
        private FriendshipRepositoryInterface    $friendshipRepository
    ) {}
    private function checkUserAuth(): User
    {
        $currentUser = Auth::guard('user')->user();
        if (!$currentUser) {
            throw new Exception("Unauthenticated.");
        }
        return $currentUser;
    }

    public function sendRequest(int $addresseeId): FriendRequest
    {
        $currentUser = $this->checkUserAuth();

        if ($currentUser->id === $addresseeId) {
            throw new Exception("You cannot send a friend request to yourself.");
        }

        // Check if they are already friends
        $lowId = min($currentUser->id, $addresseeId);
        $highId = max($currentUser->id, $addresseeId);
        $friendshipExists = $this->friendshipRepository->first([
            'user_low_id'  => $lowId,
            'user_high_id' => $highId,
        ]);
        if ($friendshipExists) {
            throw new Exception("You are already friends with this user.");
        }

        // Check for duplicate pending requests
        $existingRequest = $this->friendRequestRepository->first([
            'requester_id' => $currentUser->id,
            'addressee_id' => $addresseeId,
            'status'       => FriendRequestStatusEnum::PENDING->value,
        ]);
        if ($existingRequest) {
            throw new Exception("A pending friend request already exists.");
        }

        // In case there is an incoming pending request from the other side, we shouldn't send another one.
        $incomingRequest = $this->friendRequestRepository->first([
            'requester_id' => $addresseeId,
            'addressee_id' => $currentUser->id,
            'status'       => FriendRequestStatusEnum::PENDING->value,
        ]);
        if ($incomingRequest) {
            throw new Exception("You already have a pending friend request from this user.");
        }

        // Let's create or update existing request if there was a rejected one
        $pastRequest = $this->friendRequestRepository->first([
            'requester_id' => $currentUser->id,
            'addressee_id' => $addresseeId,
        ]);

        if ($pastRequest) {
            $pastRequest->update([
                'status'       => FriendRequestStatusEnum::PENDING->value,
                'responded_at' => null,
            ]);
            return $pastRequest;
        }

        return $this->friendRequestRepository->create([
            'requester_id' => $currentUser->id,
            'addressee_id' => $addresseeId,
            'status'       => FriendRequestStatusEnum::PENDING->value,
        ]);
    }

    public function listPendingRequests(?string $search = null): array
    {
        $currentUser = $this->checkUserAuth();

        $requests = $this->friendRequestRepository->get(
            conditions: [
                'addressee_id' => $currentUser->id,
                'status'       => FriendRequestStatusEnum::PENDING->value,
            ],
            relations: ['requester']
        );

        if ($search) {
            $search = strtolower($search);
            $requests = $requests->filter(function ($request) use ($search) {
                $requester = $request->requester;
                return str_contains(strtolower($requester->username ?? ''), $search)
                    || str_contains(strtolower($requester->full_name ?? ''), $search);
            });
        }

        return $requests->values()->all();
    }

    public function listSentRequests(?string $search = null): array
    {
        $currentUser = $this->checkUserAuth();

        $requests = $this->friendRequestRepository->get(
            conditions: [
                'requester_id' => $currentUser->id,
                'status'       => FriendRequestStatusEnum::PENDING->value,
            ],
            relations: ['addressee']
        );

        if ($search) {
            $search = strtolower($search);
            $requests = $requests->filter(function ($request) use ($search) {
                $addressee = $request->addressee;
                return str_contains(strtolower($addressee->username ?? ''), $search)
                    || str_contains(strtolower($addressee->full_name ?? ''), $search);
            });
        }

        return $requests->values()->all();
    }

    public function acceptRequest(int $requestId): Friendship
    {
        $currentUser = Auth::guard('user')->user();
        if (!$currentUser) {
            throw new Exception("Unauthenticated.");
        }

        $request = $this->friendRequestRepository->findOrFail($requestId);

        if ($request->addressee_id !== $currentUser->id) {
            throw new Exception("Unauthorized to accept this friend request.");
        }

        if ($request->status !== FriendRequestStatusEnum::PENDING->value) {
            throw new Exception("This request is not pending.");
        }

        return DB::transaction(function () use ($request) {
            $request->update([
                'status'       => FriendRequestStatusEnum::ACCEPTED->value,
                'responded_at' => now(),
            ]);

            $lowId = min($request->requester_id, $request->addressee_id);
            $highId = max($request->requester_id, $request->addressee_id);

            return $this->friendshipRepository->create([
                'user_low_id'       => $lowId,
                'user_high_id'      => $highId,
                'source_request_id' => $request->id,
            ]);
        });
    }

    public function rejectRequest(int $requestId): FriendRequest
    {
        $currentUser = $this->checkUserAuth();

        $request = $this->friendRequestRepository->findOrFail($requestId);

        if ($request->addressee_id !== $currentUser->id) {
            throw new Exception("Unauthorized to reject this friend request.");
        }

        if ($request->status !== FriendRequestStatusEnum::PENDING->value) {
            throw new Exception("This request is not pending.");
        }

        $request->update([
            'status'       => FriendRequestStatusEnum::REJECTED->value,
            'responded_at' => now(),
        ]);

        return $request;
    }

    public function cancelRequest(int $requestId): void
    {
        $currentUser = $this->checkUserAuth();

        $request = $this->friendRequestRepository->findOrFail($requestId);

        if ($request->requester_id !== $currentUser->id) {
            throw new Exception("Unauthorized to cancel this friend request.");
        }

        if ($request->status !== FriendRequestStatusEnum::PENDING->value) {
            throw new Exception("Only pending requests can be cancelled.");
        }

        $this->friendRequestRepository->delete($requestId);
    }

    public function listFriends(?string $search = null): array
    {
        $currentUser = $this->checkUserAuth();
        $friends = $currentUser->friends;

        if ($search) {
            $search = strtolower($search);
            $friends = $friends->filter(function ($friend) use ($search) {
                return str_contains(strtolower($friend->username ?? ''), $search)
                    || str_contains(strtolower($friend->full_name ?? ''), $search);
            });
        }

        return $friends->values()->all();
    }

    public function removeFriendship(int $friendId): void
    {
        $currentUser = $this->checkUserAuth();

        $lowId = min($currentUser->id, $friendId);
        $highId = max($currentUser->id, $friendId);

        $friendship = $this->friendshipRepository->first([
            'user_low_id'  => $lowId,
            'user_high_id' => $highId,
        ]);

        if (!$friendship) {
            throw new Exception("No friendship exists with this user.");
        }

        // Inside a transaction, we delete the friendship and also delete or update the associated friend request so a request can be sent again
        DB::transaction(function () use ($friendship) {
            if ($friendship->source_request_id) {
                $this->friendRequestRepository->delete($friendship->source_request_id);
            }
            $this->friendshipRepository->delete($friendship->id);
        });
    }
}
