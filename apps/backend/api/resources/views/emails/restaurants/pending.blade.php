@component('mail::message')
# Your restaurant is under review

Hi {{ $data['restaurant_name'] ?? 'there' }},

Thanks for registering your restaurant with Bite Club. Your application is currently under review.

@component('mail::panel')
We will notify you as soon as the review is completed.
@endcomponent

In the meantime, please make sure your restaurant profile is complete and accurate.

Regards,

Bite Club Team
@endcomponent
