import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// Protected (admin) routes
router.route('/').post(protect, createProduct);
router.route('/:id').put(protect, updateProduct).delete(protect, deleteProduct);

export default router;