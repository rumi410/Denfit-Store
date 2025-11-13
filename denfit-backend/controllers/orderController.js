import Order from '../models/Order.js';
import { orderConfirmationEmailTemplate } from '../utils/emailTemplates.js';
import sendEmail from '../utils/email.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    const { items, shippingAddress, paymentMethod, totalAmount, customerDetails } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }
    
    try {
        const order = new Order({
            orderItems: items.map(item => ({
                name: item.name,
                qty: item.quantity,
                image: item.images[0],
                price: item.price,
                product: item._id,
                size: item.size,
                color: item.color,
            })),
            userId: req.user._id,
            shippingAddress,
            customerDetails,
            paymentMethod,
            totalAmount,
        });

        const createdOrder = await order.save();
        
        try {
            await sendEmail({
                to: customerDetails.email, // Send to customer's provided email
                subject: `Your DENFIT Order #${createdOrder._id.toString().slice(-6).toUpperCase()} is Confirmed!`,
                html: orderConfirmationEmailTemplate(customerDetails.name, createdOrder._id.toString().slice(-6).toUpperCase(), createdOrder)
            });
        } catch(emailError) {
            console.error("Failed to send order confirmation email:", emailError);
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Server error creating order:", error);
        res.status(500).json({ message: 'Server error creating order', error: error.message });
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
