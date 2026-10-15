import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// @desc    Get budget (for given month/year or current)
// @route   GET /api/budget
export const getBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budget = await Budget.findOne({ user: req.user._id, month, year });

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const spentAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const spent = spentAgg[0]?.total || 0;
    const amount = budget?.amount || 0;
    const percentage = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;

    res.json({
      success: true,
      budget: {
        _id: budget?._id,
        amount,
        month,
        year,
        spent,
        remaining: Math.max(amount - spent, 0),
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budget
export const createBudget = async (req, res, next) => {
  try {
    const { amount, month, year } = req.body;

    const existing = await Budget.findOne({ user: req.user._id, month, year });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Budget already exists for this month' });
    }

    const budget = await Budget.create({ user: req.user._id, amount, month, year });
    res.status(201).json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budget
export const updateBudget = async (req, res, next) => {
  try {
    const { amount, month, year } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month, year },
      { amount },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};