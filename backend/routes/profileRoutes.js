import express from 'express';
import { body } from 'express-validator';
import {
  updateProfile,
  changePassword,
  uploadProfilePicture,
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.put(
  '/',
  [body('name').trim().notEmpty().withMessage('Name is required')],
  validate,
  updateProfile
);

router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

router.post('/upload', upload.single('profilePicture'), uploadProfilePicture);

export default router;