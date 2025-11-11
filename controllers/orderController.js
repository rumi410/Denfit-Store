

const Order = require('../models/Order');
const User = require('../models/User');
const { sendEmail, getOrderConfirmationHTML } = require('../utils/email');

// --- Controller to CREATE a new order (SECURE) ---
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    const userId = req.user._id; // Get user ID from our auth middleware

    // Validation
    if (!items || items.length === 0 || !totalAmount || !shippingAddress) {
      return res.status(400).json({ message: 'Missing required order information.' });
    }

    // Map frontend cart items to backend order items schema
    const orderItems = items.map(item => ({
        name: item.name,
        qty: item.quantity,
        image: item.images[0], // Use the first image for the order summary
        price: item.price,
        product: item._id,
    }));
    
    const newOrder = new Order({
      userId,
      orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    const savedOrder = await newOrder.save();

    // --- AUTOMATIC EMAIL ---
    if (req.user) {
        await sendEmail({
            to: req.user.email,
            subject: `Your DENFIT Order Confirmation #${savedOrder._id.toString().slice(-6).toUpperCase()}`,
            html: getOrderConfirmationHTML(req.user.name, savedOrder),
        });
    }
    // -----------------------

    res.status(201).json(savedOrder);

  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// --- Controller to GET all orders (for an admin) ---
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// --- Controller for a user to GET THEIR OWN orders (SECURE) ---
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from our auth middleware
        const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your orders', error: error.message });
    }
};

// Controller to update the status of an order
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // e.g., "Shipped", "Delivered"

    if (!['Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();

    res.status(200).json({ message: 'Order status updated successfully.', order: updatedOrder });

  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};


module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus
};