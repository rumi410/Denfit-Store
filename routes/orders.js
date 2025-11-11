const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/orderController');
const auth = require('../middleware/auth');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', auth, createOrder);

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', auth, getMyOrders);

module.exports = router;
