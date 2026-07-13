<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Password OTP - Bite Club</title>
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
        .otp {
            display: inline-block;
            font-size: 32px;
            font-weight: 800;
            color: #ff5a5f;
            background-color: #fff0f0;
            border: 2px dashed #ff5a5f;
            padding: 12px 30px;
            letter-spacing: 4px;
            border-radius: 8px;
            margin-bottom: 30px;
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
        <h1>Reset Your Password</h1>
        <p>Your password reset code is</p>
        <div class="otp">{{ $otp }}</div>
        <p>This code expires in 10 minutes.</p>
        <div class="footer">
            &copy; {{ date('Y') }} Bite Club. All rights reserved.
        </div>
    </div>
</body>
</html>
