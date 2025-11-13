// This file centralizes the HTML structure for all emails.

const DENFIT_LOGO_URL = "https://i.postimg.cc/w1HSCtMP/logo-url.png";

export const getEmailHtml = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background-color: #0f172a; padding: 20px; text-align: center; }
        .header img { max-height: 50px; }
        .content { padding: 30px; color: #333; line-height: 1.6; }
        .content h1 { color: #0f172a; }
        .passcode { font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 4px; text-align: center; margin: 20px 0; padding: 15px; background-color: #eef2ff; border-radius: 5px; }
        .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${DENFIT_LOGO_URL}" alt="DENFIT Logo">
        </div>
        <div class="content">
          <h1>${title}</h1>
          ${content}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} DENFIT. All Rights Reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};

export const welcomeEmailTemplate = (name) => {
    const title = `Welcome to DENFIT, ${name}!`;
    const content = `<p>We're thrilled to have you on board. Get ready to explore our latest collections and redefine your style.</p><p>Happy shopping!</p>`;
    return getEmailHtml(title, content);
};

export const orderConfirmationEmailTemplate = (name, orderId) => {
    const title = 'Your Order is Confirmed!';
    const content = `<p>Hi ${name},</p><p>Thank you for your purchase! We've received your order #${orderId} and are getting it ready for you.</p><p>You can view your order details in your account.</p>`;
    return getEmailHtml(title, content);
};

export const passwordResetEmailTemplate = (passcode) => {
    const title = 'Your Password Reset Code';
    const content = `<p>We received a request to reset your password. Please use the passcode below to complete the process. This code will expire in 10 minutes.</p><div class="passcode">${passcode}</div><p>If you did not request a password reset, please ignore this email.</p>`;
    return getEmailHtml(title, content);
};
