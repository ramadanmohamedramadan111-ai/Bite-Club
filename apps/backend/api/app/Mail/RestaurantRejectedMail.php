<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class RestaurantRejectedMail extends Mailable implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly array $data
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your restaurant application was rejected'
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.restaurants.rejected'
        );
    }
}
