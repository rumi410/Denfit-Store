const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', signup);

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

module.exports = router;
