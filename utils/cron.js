const cron = require('node-cron');
const User = require('../models/User');
const Order = require('../models/Order');
const { sendEmail, getAbandonedCartHTML } = require('./email');

// This function will run on a schedule
const checkAbandonedCarts = async () => {
    console.log('Running abandoned cart check...');
    
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        // Find users who meet all conditions:
        // 1. Logged in more than 30 minutes ago.
        // 2. Have not been sent an abandoned cart notification yet.
        const potentialUsers = await User.find({
            lastLogin: { $lt: thirtyMinutesAgo },
            abandonedCartNotified: false
        });

        for (const user of potentialUsers) {
            // For each user, check if they have placed an order since their last login
            const recentOrder = await Order.findOne({
                userId: user._id,
                createdAt: { $gte: user.lastLogin }
            });

            // If there are NO recent orders, they abandoned their session
            if (!recentOrder) {
                console.log(`Sending abandoned cart email to ${user.email}`);
                // Send the email
                await sendEmail({
                    to: user.email,
                    subject: "You left something in your cart...",
                    html: getAbandonedCartHTML(user.name)
                });

                // Mark the user as notified to prevent sending multiple emails
                user.abandonedCartNotified = true;
                await user.save();
            }
        }
    } catch (error) {
        console.error('Error checking for abandoned carts:', error);
    }
};

// Schedule the task to run every 30 minutes
const start = () => {
    // The cron schedule '*/30 * * * *' means "at every 30th minute"
    cron.schedule('*/30 * * * *', checkAbandonedCarts);
    console.log('Abandoned cart checker scheduled to run every 30 minutes.');
};

module.exports = { start };
