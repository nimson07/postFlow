import express from 'express';
import { body } from 'express-validator';
import { verifyToken as verifyTokenMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Validation middleware
const validateCheckEmail = [
  body('email').isEmail().normalizeEmail()
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const validateSetPassword = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

// Routes
router.post('/check-email', validateCheckEmail, authController.checkEmail);
router.post('/login', validateLogin, authController.login);
router.post('/set-password', validateSetPassword, authController.setPassword);
router.get('/verify', verifyTokenMiddleware, authController.verifyToken);
router.get('/me', verifyTokenMiddleware, authController.getCurrentUser);

export default router;
