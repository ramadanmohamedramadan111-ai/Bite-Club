<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailable;

class TestMail extends Mailable
{
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bite Club Test Email',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: '<h1>Hello from Bite Club 🚀</h1><p>If you can read this, Mailtrap is working.</p>',
        );
    }
}