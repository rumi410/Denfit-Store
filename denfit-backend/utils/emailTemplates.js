const DENFIT_LOGO_URL = "https://i.postimg.cc/w1HSCtMP/logo-url.png";
const WEBSITE_URL = "https://denfit.shop/";

const getBaseTemplate = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
      .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
      .header { padding: 20px; text-align: center; border-bottom: 1px solid #ddd; }
      .header img { max-height: 40px; }
      .content { padding: 30px; color: #333; line-height: 1.6; }
      .button { display: inline-block; background-color: #0f172a; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
      .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd;}
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${DENFIT_LOGO_URL}" alt="DENFIT Logo">
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} DENFIT. All Rights Reserved.
      </div>
    </div>
  </body>
  </html>
`;

export const welcomeEmailTemplate = (name) => {
    const content = `
        <h2 style="color: #2563eb;">Welcome to DENFIT, ${name}!</h2>
        <p>We are so excited to have you join our community of fashion lovers.</p>
        <p>At DENFIT, we believe in quality, style, and comfort. We are dedicated to bringing you the best premium fashion to express your unique personality.</p>
        <p>As a new member, you'll be the first to know about our new arrivals, exclusive sales, and special events.</p>
        <a href="${WEBSITE_URL}" class="button" style="background-color: #2563eb;">Start Shopping Now</a>
        <p style="margin-top: 20px;">Thank you for choosing us.</p>
        <p><strong>The DENFIT Team</strong></p>
    `;
    return getBaseTemplate(content);
};

export const loginNotificationEmailTemplate = (name) => {
    const content = `
        <h2 style="color: #333;">Thank you for logging in, ${name}!</h2>
        <p>We've noticed you logged into your DENFIT account. We're glad to have you back!</p>
        <p>Feel free to browse our latest collections and find your next favorite outfit.</p>
        <a href="${WEBSITE_URL}" class="button">Continue to the Store</a>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">If this wasn't you, please secure your account immediately.</p>
        <p><strong>The DENFIT Team</strong></p>
    `;
    return getBaseTemplate(content);
};

export const orderConfirmationEmailTemplate = (name, orderId, order) => {
    const content = `
        <h2 style="color: #16a34a;">Your Order is Confirmed, ${name}!</h2>
        <p>Thank you for your purchase from DENFIT. We've received your order and are getting it ready for you. Here are the details:</p>
        <p><strong>Order ID:</strong> #${orderId}</p>
        <div style="border-top: 1px solid #eee; margin-top: 15px; padding-top: 15px;">
            ${order.orderItems.map(item => `
              <div style="display: flex; margin-bottom: 10px; align-items: center;">
                <div style="flex-grow: 1;">
                  <p style="margin: 0;"><strong>${item.name}</strong> (x${item.qty})</p>
                  <p style="margin: 0; font-size: 12px; color: #777;">Size: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}</p>
                </div>
                <p style="margin: 0;">$${(item.price * item.qty).toFixed(2)}</p>
              </div>
            `).join('')}
        </div>
        <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px; text-align: right;">
            <p style="margin: 0; font-size: 18px;"><strong>Total: $${order.totalAmount.toFixed(2)}</strong></p>
        </div>
        <p style="margin-top: 20px;"><strong>Shipping to:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
        <a href="${WEBSITE_URL}" class="button" style="background-color: #16a34a;">Track Your Order</a>
        <p style="margin-top: 20px;">Thank you for choosing DENFIT, where quality meets style.</p>
        <p><strong>The DENFIT Team</strong></p>
    `;
    return getBaseTemplate(content);
};

export const abandonedCartEmailTemplate = (name) => {
    const content = `
        <h2 style="color: #f59e0b;">Did you forget something, ${name}?</h2>
        <p>We noticed you were checking out some amazing styles at DENFIT but didn't complete your purchase. Your next favorite outfit is waiting for you!</p>
        <p>Our new collection is selling fast, and we wouldn't want you to miss out.</p>
        <p><strong>Plus, enjoy our current sale on all items!</strong></p>
        <a href="${WEBSITE_URL}" class="button" style="background-color: #f59e0b; color: #ffffff;">Return to Your Cart</a>
        <p style="margin-top: 20px;">We're here if you have any questions.</p>
        <p><strong>The DENFIT Team</strong></p>
    `;
    return getBaseTemplate(content);
};

export const passwordResetEmailTemplate = (passcode) => {
    const content = `
        <h2 style="color: #0f172a;">Your Password Reset Code</h2>
        <p>We received a request to reset your password. Please use the passcode below to complete the process. This code will expire in 10 minutes.</p>
        <div style="font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 4px; text-align: center; margin: 20px 0; padding: 15px; background-color: #eef2ff; border-radius: 5px;">${passcode}</div>
        <p>If you did not request a password reset, please ignore this email.</p>
    `;
    return getBaseTemplate(content);
};

export const promotionalEmailTemplate = (name) => {
    const content = `
        <h2 style="color: #2563eb;">Exclusive Deals Just For You, ${name}!</h2>
        <p>It's been a while! We've got new arrivals and special offers we think you'll love.</p>
        <p>Don't miss out on the latest trends and our biggest sale of the season. Your next favorite outfit is just a click away.</p>
        <a href="${WEBSITE_URL}" class="button" style="background-color: #2563eb;">Shop New Arrivals</a>
        <p style="margin-top: 20px;">Style is waiting.</p>
        <p><strong>The DENFIT Team</strong></p>
    `;
    return getBaseTemplate(content);
};
