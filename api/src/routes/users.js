import express from 'express';
import { body } from 'express-validator';
import { verifyToken, requireRole } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Validation middleware
const validateCreateUser = [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().notEmpty(),
  body('role').isIn(['USER', 'ADMIN'])
];

const validateUpdateUser = [
  body('name').optional().trim().notEmpty(),
  body('role').optional().isIn(['USER', 'ADMIN'])
];

// Routes - All require authentication and admin role
router.get('/', verifyToken, requireRole('ADMIN'), userController.getUsers);
router.post('/', verifyToken, requireRole('ADMIN'), validateCreateUser, userController.createUser);
router.put('/:id', verifyToken, requireRole('ADMIN'), validateUpdateUser, userController.updateUser);
router.delete('/:id', verifyToken, requireRole('ADMIN'), userController.deleteUser);

export default router;
