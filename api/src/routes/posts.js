import express from 'express';
import { body } from 'express-validator';
import { verifyToken, requireRole } from '../middleware/auth.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

// Validation middleware
const validateCreatePost = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('content').trim().notEmpty()
];

const validateUpdateStatus = [
  body('status').isIn(['PENDING', 'APPROVED', 'REJECTED']),
  body('rejectionReason').optional().trim()
];

// Routes
router.get('/', verifyToken, postController.getPosts);
router.post('/', verifyToken, requireRole('USER'), validateCreatePost, postController.createPost);
router.patch('/:id/status', verifyToken, requireRole('ADMIN'), validateUpdateStatus, postController.updatePostStatus);
router.delete('/:id', verifyToken, postController.deletePost);

export default router;
