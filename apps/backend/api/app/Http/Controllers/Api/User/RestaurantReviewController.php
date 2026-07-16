<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Requests\User\Review\CreateReviewRequest;
use App\Http\Requests\User\Review\UpdateReviewRequest;
use App\Http\Requests\User\Review\IndexReviewRequest;
use App\Http\Requests\User\Review\GetMyReviewRequest;
use App\Http\Requests\User\Review\DestroyReviewRequest;
use App\DTOs\User\Review\CreateReviewDto;
use App\DTOs\User\Review\UpdateReviewDto;
use App\DTOs\User\Review\IndexReviewDto;
use App\DTOs\User\Review\GetMyReviewDto;
use App\DTOs\User\Review\DestroyReviewDto;
use App\Services\Application\User\Review\RestaurantReviewApplicationService;
use App\Traits\ApiResponseTrait;

class RestaurantReviewController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private RestaurantReviewApplicationService $appService
    ) {}

    public function index(IndexReviewRequest $request): JsonResponse
    {
        try {
            $dto = IndexReviewDto::fromValidatedRequest($request);
            $result = $this->appService->listReviews($dto);

            return $this->successResponse(
                trans('restaurant_review.listed'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to list reviews: ' . $e->getMessage());
            return $this->serverErrorResponse($e->getMessage());
        }
    }

    public function store(CreateReviewRequest $request): JsonResponse
    {
        try {
            $dto = CreateReviewDto::fromValidatedRequest($request);
            $result = $this->appService->createReview($dto);

            return $this->createdResponse(
                trans('restaurant_review.created'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to create review: ' . $e->getMessage());
            if ($e->getMessage() === trans('restaurant_review.already_reviewed')) {
                return $this->errorResponse($e->getMessage());
            }
            return $this->serverErrorResponse($e->getMessage());
        }
    }

    public function update(UpdateReviewRequest $request): JsonResponse
    {
        try {
            $dto = UpdateReviewDto::fromValidatedRequest($request);
            $result = $this->appService->updateReview($dto);

            return $this->successResponse(
                trans('restaurant_review.updated'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant_review.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to update review: ' . $e->getMessage());
            if ($e->getMessage() === trans('restaurant_review.not_found')) {
                return $this->notFoundResponse($e->getMessage());
            }
            return $this->serverErrorResponse($e->getMessage());
        }
    }

    public function destroy(DestroyReviewRequest $request): JsonResponse
    {
        try {
            $dto = DestroyReviewDto::fromValidatedRequest($request);
            $this->appService->deleteReview($dto);

            return $this->successResponse(
                trans('restaurant_review.deleted')
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant_review.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to delete review: ' . $e->getMessage());
            if ($e->getMessage() === trans('restaurant_review.not_found')) {
                return $this->notFoundResponse($e->getMessage());
            }
            return $this->serverErrorResponse($e->getMessage());
        }
    }

    public function me(GetMyReviewRequest $request): JsonResponse
    {
        try {
            $dto = GetMyReviewDto::fromValidatedRequest($request);
            $result = $this->appService->getMyReview($dto);

            if (!$result) {
                return $this->notFoundResponse(trans('restaurant_review.not_found'));
            }

            return $this->successResponse(
                trans('restaurant_review.fetched'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to fetch user review: ' . $e->getMessage());
            return $this->serverErrorResponse($e->getMessage());
        }
    }
}
