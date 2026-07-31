<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Admin\Invoice\ListAdminInvoicesRequest;
use App\DTOs\Admin\Invoice\ListAdminInvoicesDto;
use App\DTOs\Admin\Invoice\ShowAdminInvoiceDto;
use App\Http\Requests\Admin\Invoice\ShowAdminInvoiceRequest;
use App\Services\Application\Admin\Invoice\AdminInvoiceApplicationService;
use App\Http\Resources\Restaurant\InvoiceResource;
use App\Traits\ApiResponseTrait;

class InvoiceController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly AdminInvoiceApplicationService $applicationService
    ) {}

    public function index(ListAdminInvoicesRequest $request): JsonResponse
    {
        $dto = ListAdminInvoicesDto::fromValidatedRequest($request);
        
        $result = $this->applicationService->listInvoices($dto);

        return $this->successResponse(
            trans('invoice.listed_successfully'),
            [
                'data' => InvoiceResource::collection($result['data']),
                'meta' => $result['meta'],
            ]
        );
    }

    public function show(ShowAdminInvoiceRequest $request): JsonResponse
    {
        $dto = ShowAdminInvoiceDto::fromValidatedRequest($request);
        $invoice = $this->applicationService->getInvoiceDetails($dto);

        return $this->successResponse(
            trans('invoice.retrieved_successfully'),
            new InvoiceResource($invoice)
        );
    }
}
