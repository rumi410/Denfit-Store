

const Product = require('../models/Product');

// --- Controller to CREATE a new product ---
const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    if (!productData.name || !productData.price || !productData.category) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const product = await Product.create(productData);
    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// --- Controller to GET all products ---
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// --- Controller to GET a SINGLE product by its ID ---
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// --- Controller to UPDATE a product by its ID ---
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// --- Controller to DELETE a product by its ID ---
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};