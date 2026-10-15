import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCategories);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  ],
  validate,
  createCategory
);
router.put('/:id', [body('name').trim().notEmpty().withMessage('Name is required')], validate, updateCategory);
router.delete('/:id', deleteCategory);

export default router;