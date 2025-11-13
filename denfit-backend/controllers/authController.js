import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { passwordResetEmailTemplate, welcomeEmailTemplate, loginNotificationEmailTemplate } from '../utils/emailTemplates.js';
import sendEmail from '../utils/email.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, email, password });
        if (user) {
            try {
                await sendEmail({
                    to: user.email,
                    subject: `Welcome to DENFIT, ${user.name}!`,
                    html: welcomeEmailTemplate(user.name)
                });
            } catch (emailError) {
                console.error("Failed to send welcome email:", emailError);
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Server error during signup:", error);
        res.status(500).json({ message: 'Server error during signup', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            
            try {
                await sendEmail({
                    to: user.email,
                    subject: `Successful Login to DENFIT`,
                    html: loginNotificationEmailTemplate(user.name)
                });
            } catch (emailError) {
                console.error("Failed to send login notification email:", emailError);
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Password reset attempt for non-existent user: ${email}`);
            return res.status(200).json({ message: 'If a user with that email exists, a passcode has been sent.' });
        }
        const passcode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPasscode = crypto.createHash('sha256').update(passcode).digest('hex');

        user.passwordResetToken = hashedPasscode;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Your DENFIT Password Reset Code',
            html: passwordResetEmailTemplate(passcode),
        });
        
        res.status(200).json({ message: 'Passcode sent to email.' });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: 'Error sending password reset email.' });
    }
};

// @desc    Verify passcode
// @route   POST /api/auth/verify-passcode
// @access  Public
export const verifyPasscode = async (req, res) => {
    const { email, passcode } = req.body;
    const hashedPasscode = crypto.createHash('sha256').update(passcode).digest('hex');
    
    try {
        const user = await User.findOne({
            email,
            passwordResetToken: hashedPasscode,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Passcode is invalid or has expired.' });
        }
        
        res.status(200).json({ message: 'Passcode verified.' });
    } catch (error) {
         res.status(500).json({ message: 'Error verifying passcode.', error: error.message });
    }
};


// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    const { email, passcode, newPassword } = req.body;
    const hashedPasscode = crypto.createHash('sha256').update(passcode).digest('hex');

    try {
        const user = await User.findOne({
            email,
            passwordResetToken: hashedPasscode,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Passcode is invalid or has expired. Please try again.' });
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Password has been reset successfully.',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
         res.status(500).json({ message: 'Error resetting password.', error: error.message });
    }
};