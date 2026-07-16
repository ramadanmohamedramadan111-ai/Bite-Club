<?php

namespace Tests\Feature\GeneralSetting;

use App\Models\GeneralSetting;
use Tests\Feature\Auth\AdminAuthTest;

class GeneralSettingUpdateTest extends AdminAuthTest
{
    public function test_admin_can_update_general_settings(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $setting = GeneralSetting::firstOrCreate(
            [],
            [
                'commission_rate' => 10.00,
                'service_fee_amount' => 3.00,
            ]
        );

        $payload = [
            'commission_rate' => 15.50,
            'service_fee_amount' => 5.00,
        ];

        // Act
        $response = $this->withToken($token)->putJson('/api/admin/general-settings', $payload);

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('general_setting.update_success'));
        
        $this->assertDatabaseHas('general_settings', [
            'id' => $setting->id,
            'commission_rate' => 15.50,
            'service_fee_amount' => 5.00,
        ]);
    }
}
