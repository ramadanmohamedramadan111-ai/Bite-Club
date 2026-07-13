<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email - Bite Club</title>
    <style>
        body {
            font-family: 'Inter', Helvetica, Arial, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            padding: 40px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ff5a5f;
            margin-bottom: 20px;
            letter-spacing: -1px;
        }
        h1 {
            color: #2d3748;
            font-size: 24px;
            margin-bottom: 10px;
        }
        p {
            color: #718096;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            background-color: #ff5a5f;
            color: #ffffff !important;
            padding: 14px 30px;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(255, 90, 95, 0.2);
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #e0484d;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #a0aec0;
            border-top: 1px solid #edf2f7;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Bite Club 🍔</div>
        <h1>Welcome to Bite Club!</h1>
        <p>Please click the button below to verify your email address and activate your account.</p>
        <p><a href="{{ $verificationUrl }}" class="btn">Verify Email Address</a></p>
        <p style="font-size: 14px; color: #a0aec0;">If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="{{ $verificationUrl }}" style="color: #ff5a5f; text-decoration: none; word-break: break-all;">{{ $verificationUrl }}</a></p>
        <p style="font-size: 13px; color: #cbd5e0;">Note: This verification link is valid for 60 minutes.</p>
        <div class="footer">
            &copy; {{ date('Y') }} Bite Club. All rights reserved.
        </div>
    </div>
</body>
</html>
