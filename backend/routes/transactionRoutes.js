import express from 'express';
import { body } from 'express-validator';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardStats,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

const txValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

router.get('/', getTransactions);
router.get('/stats/dashboard', getDashboardStats);
router.post('/', upload.single('receiptImage'), txValidators, validate, createTransaction);
router.put('/:id', upload.single('receiptImage'), txValidators, validate, updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;