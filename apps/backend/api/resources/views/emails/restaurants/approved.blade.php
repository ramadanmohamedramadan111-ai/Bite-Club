@component('mail::message')
# Your restaurant is now active

Hi {{ $data['restaurant_name'] ?? 'there' }},

Good news. Your restaurant has been approved and is now live on Bite Club.

Status: Active

@component('mail::panel')
You can now manage your restaurant and start receiving orders.
@endcomponent

@component('mail::button', ['url' => config('app.url')])
Go to Bite Club
@endcomponent

Thanks for being part of Bite Club.
@endcomponent
