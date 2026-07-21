<?php

namespace App\Services\Application\Social;

use App\DTOs\Social\CreatePostDto;
use App\DTOs\Social\LikePostDto;
use App\DTOs\Social\CopyOrderDto;
use App\Services\Domain\Social\PostDomainService;
use App\Services\Domain\Social\PostLikeDomainService;
use App\Services\Domain\Social\OrderCopyDomainService;
use App\Models\Post;
use App\Models\OrderCopy;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PostApplicationService
{
    public function __construct(
        private readonly PostDomainService $postDomainService,
        private readonly PostLikeDomainService $postLikeDomainService,
        private readonly OrderCopyDomainService $orderCopyDomainService
    ) {}

    public function createPost(CreatePostDto $dto): Post
    {
        return $this->postDomainService->createPost(
            $dto->getUserId(),
            $dto->getOrderId(),
            $dto->getCaption(),
            $dto->getImages()
        );
    }

    public function getFeedPosts(?int $currentUserId = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->postDomainService->getFeedPosts($currentUserId, $perPage);
    }

    public function getPostDetails(int $postId, ?int $currentUserId = null): Post
    {
        return $this->postDomainService->getPostDetails($postId, $currentUserId);
    }

    public function likePost(LikePostDto $dto): int
    {
        return $this->postLikeDomainService->likePost(
            $dto->getPostId(),
            $dto->getUserId()
        );
    }

    public function unlikePost(LikePostDto $dto): int
    {
        return $this->postLikeDomainService->unlikePost(
            $dto->getPostId(),
            $dto->getUserId()
        );
    }

    public function copyOrder(CopyOrderDto $dto): array
    {
        return $this->orderCopyDomainService->copyOrder(
            $dto->getPostId(),
            $dto->getUserId()
        );
    }

    public function completeCopiedOrder(int $copiedOrderId): ?OrderCopy
    {
        return $this->orderCopyDomainService->completeCopiedOrder($copiedOrderId);
    }
}
