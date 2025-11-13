import Order from '../models/Order.js';
import { orderConfirmationEmailTemplate } from '../utils/emailTemplates.js';

// A mock email sending function. Replace with your actual email service.
const sendEmail = async ({ to, subject, html }) => {
    console.log("--- MOCK EMAIL SENDER ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Email sent successfully (mock).");
    return Promise.resolve();
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    } else {
        const order = new Order({
            orderItems: orderItems.map(item => ({
                ...item,
                product: item._id, // Map product ID correctly
                _id: undefined // Mongoose will create a new ObjectId
            })),
            userId: req.user._id,
            shippingAddress,
            paymentMethod,
            totalAmount,
        });

        try {
            const createdOrder = await order.save();
            
            // Send order confirmation email
            await sendEmail({
                to: req.user.email,
                subject: `Your DENFIT Order #${createdOrder._id.toString().slice(-6)} is Confirmed!`,
                html: orderConfirmationEmailTemplate(req.user.name, createdOrder._id.toString().slice(-6))
            });

            res.status(201).json(createdOrder);
        } catch (error) {
            res.status(500).json({ message: 'Server error creating order', error: error.message });
        }
    }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching orders', error: error.message });
    }
};


// --- Admin functions ---

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId', 'id name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching all orders', error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:orderId
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (order) {
            order.status = req.body.status || order.status;
            if (req.body.status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating order status', error: error.message });
    }
};