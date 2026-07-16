<?php

namespace Tests\Feature\GeneralSetting;

use App\Models\GeneralSetting;
use Tests\Feature\Auth\AdminAuthTest;

class GeneralSettingShowTest extends AdminAuthTest
{
    public function test_admin_can_fetch_general_settings(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        GeneralSetting::firstOrCreate(
            [],
            [
                'commission_rate' => 10.00,
                'service_fee_amount' => 3.00,
            ]
        );

        // Act
        $response = $this->withToken($token)->getJson('/api/admin/general-settings');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('general_setting.fetch_success'));
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id',
                'commission_rate',
                'service_fee_amount',
                'updated_at'
            ]
        ]);
    }
}
