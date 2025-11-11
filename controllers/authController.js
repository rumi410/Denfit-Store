

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail, getWelcomeHTML, getLoginNotificationHTML } = require('../utils/email');

// Generate JWT - Standardized to use 'id'
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// --- Controller for User SIGNUP ---
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Create a new user
    const newUser = new User({ name, email, password });

    // The password will be automatically hashed by the 'pre-save' hook in User.js
    const savedUser = await newUser.save();

    // --- AUTOMATIC WELCOME EMAIL ---
    await sendEmail({
        to: savedUser.email,
        subject: 'Welcome to DENFIT!',
        html: getWelcomeHTML(savedUser.name)
    });

    const token = generateToken(savedUser._id);

    res.status(201).json({
      token,
      user: { _id: savedUser._id, name: savedUser.name, email: savedUser.email },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during signup.', error: error.message });
  }
};

// --- Controller for User LOGIN ---
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check if password is correct
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    // Update user's last login time and reset abandoned cart status
    user.lastLogin = new Date();
    user.abandonedCartNotified = false;
    await user.save();

    // --- AUTOMATIC LOGIN NOTIFICATION EMAIL ---
    await sendEmail({
        to: user.email,
        subject: 'Successful Login to your DENFIT Account',
        html: getLoginNotificationHTML(user.name)
    });

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

module.exports = { signup, login };