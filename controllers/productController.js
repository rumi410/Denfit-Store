import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching products', error: error.message });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching product', error: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (requires protect middleware, ideally admin)
export const createProduct = async (req, res) => {
    // This is a placeholder for admin functionality.
    // In a real app, you'd get product details from req.body.
    try {
        const { name, images, description, category, subCategory, price, stock, sizes, colors } = req.body;
        const product = new Product({
            name,
            images,
            description,
            category,
            subCategory,
            price,
            stock,
            sizes,
            colors,
            // default values for reviews, etc., will be set by the model
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating product', error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (requires protect middleware, ideally admin)
export const updateProduct = async (req, res) => {
    // This is a placeholder for admin functionality.
    res.status(200).json({ message: `Product ${req.params.id} update endpoint placeholder.` });
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (requires protect middleware, ideally admin)
export const deleteProduct = async (req, res) => {
    // This is a placeholder for admin functionality.
    res.status(200).json({ message: `Product ${req.params.id} deletion endpoint placeholder.` });
};