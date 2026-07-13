@component('mail::message')
# Your application was not approved

Hi {{ $data['restaurant_name'] ?? 'there' }},

We reviewed your restaurant application and it has been rejected for now.

@component('mail::panel')
You can review your profile details and submit an updated application later if needed.
@endcomponent

If you need assistance, please reach out to support.

Regards,

Bite Club Team
@endcomponent
