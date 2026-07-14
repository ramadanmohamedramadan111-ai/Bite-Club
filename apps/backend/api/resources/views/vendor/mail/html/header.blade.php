@props(['url'])
@php
    $logoPath = public_path('assets/Bite-Club-logo-mail.png');
    $logoSrc = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
@endphp
<tr>
<td class="header" style="padding: 24px 0 8px; text-align: center;">
    <a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
        <img
            src="{{ $logoSrc }}"
            alt="{{ config('app.name') }}"
            style="display: block; width: 120px; max-width: 120px; height: auto; margin: 0 auto;"
        >
    </a>
</td>
</tr>
