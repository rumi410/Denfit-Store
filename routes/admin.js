import express from 'express';
import { getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// NOTE: These routes would ideally have an additional admin-specific middleware.
router.get('/orders', protect, getOrders);
router.put('/orders/:orderId', protect, updateOrderStatus);

export default router;