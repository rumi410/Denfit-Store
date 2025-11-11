const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const auth = require('../middleware/auth');


// @desc    Fetch all products & Create a new product
// @route   GET /api/products & POST /api/products
// @access  Public for GET, Private for POST
router.route('/').get(getProducts).post(auth, createProduct);


// @desc    Fetch, Update, and Delete a single product
// @route   GET, PUT, DELETE /api/products/:id
// @access  Public for GET, Private for PUT/DELETE
router.route('/:id').get(getProductById).put(auth, updateProduct).delete(auth, deleteProduct);

module.exports = router;
