const express = require('express');
const router = express.Router();
const { getOrders, updateOrderStatus } = require('../controllers/orderController');
const auth = require('../middleware/auth');

// In a real app, you would add an additional middleware to check for an admin role.
// For now, these routes are protected for any logged-in user.

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', auth, getOrders);

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:orderId
// @access  Private/Admin
router.put('/orders/:orderId', auth, updateOrderStatus);

module.exports = router;
