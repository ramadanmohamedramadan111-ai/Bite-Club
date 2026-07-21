<?php

namespace App\Services\Application\Admin\Social;

use App\DTOs\Social\ApprovePostDto;
use App\DTOs\Social\RejectPostDto;
use App\Services\Domain\Social\PostDomainService;
use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminPostApplicationService
{
    public function __construct(
        private readonly PostDomainService $postDomainService
    ) {}

    public function getAdminPosts(?string $status = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->postDomainService->getAdminPosts($status, $perPage);
    }

    public function approvePost(ApprovePostDto $dto): Post
    {
        return $this->postDomainService->approvePost(
            $dto->getPostId(),
            $dto->getAdminId()
        );
    }

    public function rejectPost(RejectPostDto $dto): Post
    {
        return $this->postDomainService->rejectPost(
            $dto->getPostId(),
            $dto->getAdminId(),
            $dto->getRejectionReason()
        );
    }
}
