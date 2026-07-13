@component('mail::message')
# Your restaurant is currently closed

Hi {{ $data['restaurant_name'] ?? 'there' }},

Your restaurant status has been changed to closed.

@component('mail::panel')
If this was unexpected, please contact support for more details.
@endcomponent

You can reopen your restaurant only if an admin changes the status again.

Regards,

Bite Club Team
@endcomponent
