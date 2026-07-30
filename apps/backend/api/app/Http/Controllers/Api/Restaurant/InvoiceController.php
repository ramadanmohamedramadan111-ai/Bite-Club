<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\Invoice\ListInvoicesRequest;
use App\Http\Requests\Restaurant\Invoice\ShowInvoiceRequest;
use App\DTOs\Restaurant\Invoice\ListInvoicesDto;
use App\DTOs\Restaurant\Invoice\ShowInvoiceDto;
use App\Services\Application\Restaurant\Invoice\RestaurantInvoiceApplicationService;
use App\Http\Resources\Restaurant\InvoiceResource;
use App\Http\Resources\Restaurant\InvoiceDetailsResource;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly RestaurantInvoiceApplicationService $applicationService
    ) {}

    public function index(ListInvoicesRequest $request): JsonResponse
    {
        $dto = ListInvoicesDto::fromValidatedRequest($request);

        $invoicesData = $this->applicationService->getInvoices($dto);
        
        $paginatedData = [
            'items' => InvoiceResource::collection($invoicesData['items']),
            'meta'  => $invoicesData['meta'],
        ];

        return $this->successResponse(
            trans('invoice.retrieved_successfully') ?? 'Invoices retrieved successfully',
            $paginatedData
        );
    }

    public function show(ShowInvoiceRequest $request): JsonResponse
    {
        $dto = ShowInvoiceDto::fromValidatedRequest($request);

        try {
            $invoice = $this->applicationService->getInvoiceDetails($dto);

            return $this->successResponse(
                trans('invoice.retrieved_successfully') ?? 'Invoice details retrieved successfully',
                new InvoiceDetailsResource($invoice)
            );
        } catch (\DomainException $e) {
            return $this->errorResponse($e->getMessage(), null, 404);
        }
    }
}
