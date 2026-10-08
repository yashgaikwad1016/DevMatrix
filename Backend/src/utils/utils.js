export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtphtml(otp) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevMatrix - Verification OTP</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 36px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    .brand {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      background: #eff6ff;
      color: #2563eb;
      font-size: 13px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    .otp-box {
      background-color: #f1f5f9;
      border: 1px dashed #cbd5e1;
      padding: 18px;
      border-radius: 8px;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #0f172a;
      margin: 24px 0;
    }
    .footer {
      font-size: 13px;
      color: #64748b;
      margin-top: 32px;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">DEVMATRIX</div>
    <div class="badge">Email Verification</div>
    <h2>Verify Your Account</h2>
    <p style="color: #64748b; font-size: 15px;">Please use the one-time code below to verify your email address on DevMatrix. This code is valid for 10 minutes.</p>
    <div class="otp-box">${otp}</div>
    <p style="color: #64748b; font-size: 13px;">If you didn't request this code, you can safely ignore this email.</p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} DevMatrix Platform. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}
