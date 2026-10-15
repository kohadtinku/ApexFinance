import express from 'express';
import { body } from 'express-validator';
import { getBudget, createBudget, updateBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

const budgetValidators = [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be 1-12'),
  body('year').isInt({ min: 2000 }).withMessage('Year is invalid'),
];

router.get('/', getBudget);
router.post('/', budgetValidators, validate, createBudget);
router.put('/', budgetValidators, validate, updateBudget);

export default router;