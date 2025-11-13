import express from 'express';
import { signup, login, forgotPassword, verifyPasscode, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-passcode', verifyPasscode);
router.post('/reset-password', resetPassword);

export default router;