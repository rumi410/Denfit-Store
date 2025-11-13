import User from '../models/User.js';
import Order from '../models/Order.js'; // Assuming you might need this for abandoned carts
import sendEmail from './email.js';
import { abandonedCartEmailTemplate, promotionalEmailTemplate } from './emailTemplates.js';

const ABANDONED_CART_INTERVAL = 30 * 60 * 1000; // 30 minutes
const PROMOTIONAL_EMAIL_INTERVAL = 4 * 24 * 60 * 60 * 1000; // 4 days

// --- Abandoned Cart Checker ---
const checkAbandonedCarts = async () => {
  // This is a simplified example. A real implementation would require a more
  // robust way to track carts, perhaps in a separate collection.
  console.log('Running abandoned cart check...');
  try {
      // Find users who have not placed an order recently but have logged in.
      const thirtyMinsAgo = new Date(Date.now() - ABANDONED_CART_INTERVAL);
      const recentOrders = await Order.find({ createdAt: { $gte: thirtyMinsAgo } }).select('userId');
      const recentUserIds = recentOrders.map(o => o.userId);
      
      // Find users who haven't ordered recently
      const potentialCustomers = await User.find({ _id: { $nin: recentUserIds } });

      for (const user of potentialCustomers) {
        console.log(`Sending abandoned cart reminder to ${user.email}`);
        await sendEmail({
            to: user.email,
            subject: `Did you forget something, ${user.name}?`,
            html: abandonedCartEmailTemplate(user.name)
        });
      }
  } catch (error) {
    console.error("Error in abandoned cart checker:", error);
  }
};

export const startAbandonedCartChecker = () => {
  console.log('Abandoned cart checker scheduled to run every 30 minutes.');
  // setInterval(checkAbandonedCarts, ABANDONED_CART_INTERVAL); // You can uncomment this to activate it
};


// --- Promotional Emailer ---
const sendPromotionalEmails = async () => {
    console.log('Running promotional emailer...');
    try {
        const users = await User.find({}, 'email name');
        console.log(`Found ${users.length} users to send promotional emails to.`);
        for (const user of users) {
             await sendEmail({
                to: user.email,
                subject: `Exclusive Deals Just For You!`,
                html: promotionalEmailTemplate(user.name)
            });
        }
    } catch (error) {
        console.error("Error sending promotional emails:", error);
    }
};

export const startPromotionalEmailer = () => {
  console.log('Promotional emailer scheduled to run every 4 days.');
  // setInterval(sendPromotionalEmails, PROMOTIONAL_EMAIL_INTERVAL); // You can uncomment this to activate it
};
