<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Requests\GeneralSetting\ShowGeneralSettingRequest;
use App\Http\Requests\GeneralSetting\UpdateGeneralSettingRequest;
use App\DTOs\GeneralSetting\ShowGeneralSettingDto;
use App\DTOs\GeneralSetting\UpdateGeneralSettingDto;
use App\Services\Application\GeneralSettingApplicationService;

class GeneralSettingController extends Controller
{
    public function __construct(
        private GeneralSettingApplicationService $generalSettingApplicationService
    ) {}

    public function show(ShowGeneralSettingRequest $request): JsonResponse
    {
        try {

            $result = $this->generalSettingApplicationService->show();

            return $this->successResponse(
                trans('general_setting.fetch_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('general_setting.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to fetch general settings: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('general_setting.fetch_failed'));
        }
    }

    public function update(UpdateGeneralSettingRequest $request): JsonResponse
    {
        try {
            $dto = UpdateGeneralSettingDto::fromValidatedRequest($request);
            $result = $this->generalSettingApplicationService->update($dto);

            return $this->successResponse(
                trans('general_setting.update_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('general_setting.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to update general settings: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('general_setting.update_failed'));
        }
    }
}
