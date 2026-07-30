<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\Reviews\RestaurantReviewsRequest;
use App\DTOs\Restaurant\Reviews\RestaurantReviewsDto;
use App\Services\Application\Restaurant\Reviews\RestaurantReviewsApplicationService;
use App\Http\Resources\Restaurant\Review\RestaurantReviewResource;
use Illuminate\Http\JsonResponse;

class RestaurantReviewController extends Controller
{
    public function __construct(
        private readonly RestaurantReviewsApplicationService $reviewsService
    ) {}

    public function index(RestaurantReviewsRequest $request): JsonResponse
    {
        $dto = RestaurantReviewsDto::fromValidatedRequest($request);

        $data = $this->reviewsService->getReviewsData($dto);

        $paginator = $data['reviews'];
        $paginator->withPath(config('app.url') . $request->getPathInfo());
        $paginatedData = RestaurantReviewResource::collection($paginator);

        return $this->successResponse(
            trans('restaurant.reviews_retrieved') ?? 'Reviews data retrieved successfully',
            [
                'summary' => $data['summary'],
                'reviews' => [
                    'data' => $paginatedData,
                    'meta' => [
                        'current_page' => $paginator->currentPage(),
                        'last_page' => $paginator->lastPage(),
                        'per_page' => $paginator->perPage(),
                        'total' => $paginator->total(),
                    ]
                ]
            ]
        );
    }
}
