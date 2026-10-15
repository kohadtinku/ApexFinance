import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({
      type: 1,
      name: 1,
    });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    const existing = await Category.findOne({
      user: req.user._id,
      name: { $regex: `^${name}$`, $options: 'i' },
      type,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      type,
      isDefault: false,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (category.isDefault) {
      return res.status(400).json({ success: false, message: 'Cannot edit default categories' });
    }

    category.name = req.body.name ?? category.name;
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (category.isDefault) {
      return res.status(400).json({ success: false, message: 'Cannot delete default categories' });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};