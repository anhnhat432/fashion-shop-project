const Category = require("../models/Category");
const Product = require("../models/Product");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findCategoryByName = (name, excludedId) => {
  const query = {
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
  };

  if (excludedId) {
    query._id = { $ne: excludedId };
  }

  return Category.findOne(query);
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });

    const exists = await findCategoryByName(name);
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });

    const category = await Category.create({ name });
    res
      .status(201)
      .json({ success: true, message: "Category created", data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });

    const exists = await findCategoryByName(name, req.params.id);
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true },
    );
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category updated", data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const hasProducts = await Product.exists({ categoryId: req.params.id });
    if (hasProducts) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete category while products still belong to it",
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
