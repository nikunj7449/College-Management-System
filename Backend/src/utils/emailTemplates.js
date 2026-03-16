const getWelcomeEmailTemplate = (name, role, username, password, loginUrl) => {
  const collegeName = process.env.COLLEGE_NAME || "SmartCMS College Management";
  const collegeLogo =
    process.env.COLLEGE_LOGO ||
    "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/graduation-cap.svg";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${collegeName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .wrapper {
      padding: 40px 16px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 6px;
      border: 1px solid #dedcff4a;
      box-shadow:
        0 0 5px rgba(90,82,253,0.2),
        0 0 15px rgba(90,82,253,0.15),
        0 0 30px rgba(90,82,253,0.1);
    }
    .header {
      background-color: #1a3a6b;
      padding: 24px 32px;
      text-align: center;
      border-radius: 6px 6px 0 0;
    }
    .header img {
      height: 44px;
      filter: invert(1) brightness(2);
      margin-bottom: 10px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 20px;
      font-weight: bold;
    }
    .content {
      padding: 32px;
    }
    .content h2 {
      font-size: 18px;
      color: #1a3a6b;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .content p {
      font-size: 14px;
      color: #555555;
      line-height: 1.6;
      margin: 0 0 20px;
    }
    .credentials {
      background-color: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-left: 4px solid #1a3a6b;
      border-radius: 4px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .credentials table {
      width: 100%;
      border-collapse: collapse;
    }
    .credentials td {
      padding: 6px 0;
      font-size: 14px;
    }
    .credentials td:first-child {
      color: #777777;
      width: 140px;
      font-weight: bold;
    }
    .credentials td:last-child {
      color: #1a1a1a;
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
    }
    .btn-wrap {
      text-align: center;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background-color: #1a3a6b;
      color: #ffffff !important;
      text-decoration: none;
      padding: 11px 28px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
    }
    .notice {
      font-size: 13px;
      color: #666666;
      background: #fffdf0;
      border: 1px solid #f0e68c;
      border-radius: 4px;
      padding: 12px 14px;
      margin-bottom: 0;
      line-height: 1.55;
    }
    .footer {
      background-color: #f4f4f4;
      padding: 18px 32px;
      text-align: center;
      border-top: 1px solid #dddddd;
      border-radius: 0 0 6px 6px;
    }
    .footer p {
      margin: 0;
      font-size: 12px;
      color: #999999;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <div class="header">
        <img src="${collegeLogo}" alt="${collegeName}">
        <h1>${collegeName}</h1>
      </div>

      <div class="content">
        <h2>Welcome, ${name}!</h2>
        <p>
          Your <strong>${role}</strong> account has been created. Please find your login credentials below.
        </p>

        <div class="credentials">
          <table>
            <tr>
              <td>Username / Email</td>
              <td>${username}</td>
            </tr>
            <tr>
              <td>Temporary Password</td>
              <td>${password}</td>
            </tr>
          </table>
        </div>

        <div class="btn-wrap">
          <a href="${loginUrl}" class="btn">Login to Portal</a>
        </div>

        <p class="notice">
          <strong>Note:</strong> Your temporary password is based on your date of birth. Please change it immediately after your first login from your profile settings.
        </p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${collegeName}. All rights reserved.</p>
        <p>For account issues, contact the IT Administration Helpdesk.</p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
};

const getOtpEmailTemplate = (otp, targetName) => {
  const collegeName = process.env.COLLEGE_NAME || "SmartCMS College Management";
  const collegeLogo =
    process.env.COLLEGE_LOGO ||
    "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/graduation-cap.svg";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP - ${collegeName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .wrapper {
      padding: 40px 16px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 6px;
      border: 1px solid #dedcff4a;
      box-shadow: 0 0 30px rgba(90,82,253,0.1);
    }
    .header {
      background-color: #1a3a6b;
      padding: 24px 32px;
      text-align: center;
      border-radius: 6px 6px 0 0;
    }
    .header img {
      height: 44px;
      filter: invert(1) brightness(2);
      margin-bottom: 10px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 20px;
      font-weight: bold;
    }
    .content {
      padding: 32px;
    }
    .content h2 {
      font-size: 18px;
      color: #1a3a6b;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .content p {
      font-size: 14px;
      color: #555555;
      line-height: 1.6;
      margin: 0 0 20px;
    }
    .otp-box {
      background-color: #f9f9f9;
      border: 2px dashed #1a3a6b;
      border-radius: 4px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #1a3a6b;
    }
    .footer {
      background-color: #f4f4f4;
      padding: 18px 32px;
      text-align: center;
      border-top: 1px solid #dddddd;
      border-radius: 0 0 6px 6px;
    }
    .footer p {
      margin: 0;
      font-size: 12px;
      color: #999999;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${collegeLogo}" alt="${collegeName}">
        <h1>${collegeName}</h1>
      </div>
      <div class="content">
        <h2>Password Reset Authorization</h2>
        <p>
          Hello Authority, a password reset request has been initiated for <strong>${targetName}</strong>. 
          Please provide the following OTP to the user if verified.
        </p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p>This OTP is valid for 10 minutes only.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${collegeName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

const getResetLinkEmailTemplate = (name, resetUrl) => {
  const collegeName = process.env.COLLEGE_NAME || "SmartCMS College Management";
  const collegeLogo =
    process.env.COLLEGE_LOGO ||
    "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/graduation-cap.svg";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request - ${collegeName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .wrapper {
      padding: 40px 16px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 6px;
      border: 1px solid #dedcff4a;
      box-shadow: 0 0 30px rgba(90,82,253,0.1);
    }
    .header {
      background-color: #1a3a6b;
      padding: 24px 32px;
      text-align: center;
      border-radius: 6px 6px 0 0;
    }
    .header img {
      height: 44px;
      filter: invert(1) brightness(2);
      margin-bottom: 10px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 20px;
      font-weight: bold;
    }
    .content {
      padding: 32px;
    }
    .content h2 {
      font-size: 18px;
      color: #1a3a6b;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .content p {
      font-size: 14px;
      color: #555555;
      line-height: 1.6;
      margin: 0 0 20px;
    }
    .btn-wrap {
      text-align: center;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background-color: #1a3a6b;
      color: #ffffff !important;
      text-decoration: none;
      padding: 11px 28px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
    }
    .footer {
      background-color: #f4f4f4;
      padding: 18px 32px;
      text-align: center;
      border-top: 1px solid #dddddd;
      border-radius: 0 0 6px 6px;
    }
    .footer p {
      margin: 0;
      font-size: 12px;
      color: #999999;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${collegeLogo}" alt="${collegeName}">
        <h1>${collegeName}</h1>
      </div>
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>
          You have requested to reset your password. Please click the button below to proceed.
          You will need the OTP provided by your ${name.includes('Student') ? 'HOD' : 'Admin'} to complete the process.
        </p>
        <div class="btn-wrap">
          <a href="${resetUrl}" class="btn">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${collegeName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  getWelcomeEmailTemplate,
  getOtpEmailTemplate,
  getResetLinkEmailTemplate
};