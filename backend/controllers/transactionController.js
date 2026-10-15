import Transaction from '../models/Transaction.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

// @desc    Get all transactions with filters + pagination
// @route   GET /api/transactions
export const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    if (type && type !== 'all') query.type = type;
    if (category && category !== 'all') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    if (search) query.title = { $regex: search, $options: 'i' };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }).skip(skip).limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
export const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    let receiptImage = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'expense-tracker/receipts');
      receiptImage = result.secure_url;
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date: date || Date.now(),
      description,
      receiptImage,
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { title, amount, type, category, date, description } = req.body;

    transaction.title = title ?? transaction.title;
    transaction.amount = amount ?? transaction.amount;
    transaction.type = type ?? transaction.type;
    transaction.category = category ?? transaction.category;
    transaction.date = date ?? transaction.date;
    transaction.description = description ?? transaction.description;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'expense-tracker/receipts');
      transaction.receiptImage = result.secure_url;
    }

    await transaction.save();
    res.json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/transactions/stats/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // All-time totals
    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalIncome = totals.find((t) => t._id === 'income')?.total || 0;
    const totalExpense = totals.find((t) => t._id === 'expense')?.total || 0;
    const totalBalance = totalIncome - totalExpense;

    // Current month totals
    const monthTotals = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: { _id: '$type', total: { $sum: '$amount' } },
      },
    ]);

    const monthIncome = monthTotals.find((t) => t._id === 'income')?.total || 0;
    const monthExpense = monthTotals.find((t) => t._id === 'expense')?.total || 0;

    // Last 6 months trend
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build last 6 months array
    const trendMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      trendMap[key] = {
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        income: 0,
        expense: 0,
      };
    }

    monthlyTrend.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (trendMap[key]) {
        trendMap[key][item._id.type] = item.total;
      }
    });

    // Category breakdown for current month (expense only)
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: { _id: '$category', total: { $sum: '$amount' } },
      },
      { $sort: { total: -1 } },
    ]);

    // Recent 5 transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalBalance,
        totalIncome,
        totalExpense,
        monthIncome,
        monthExpense,
        monthlyTrend: Object.values(trendMap),
        categoryBreakdown: categoryBreakdown.map((c) => ({
          name: c._id,
          value: c.total,
        })),
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};