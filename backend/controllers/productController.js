// File: backend/controllers/productController.js

const Product = require("../models/Product");

// ============================================
// @desc    Get all products
// @route   GET /api/products
// @access  Public
// ============================================

const getProducts = async (req, res, next) => {
  try {
    // Get query parameters for filtering
    // Example: /api/products?category=Electronics&minPrice=100&maxPrice=5000
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Filter by keyword (search in name and description)
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === "price_low") sortOption = { price: 1 };
    if (sort === "price_high") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const total = await Product.countDocuments(filter);

    // Get products
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
// ============================================

const getProductById = async (req, res, next) => {
  try {
    // req.params.id = the :id in the URL
    // Example: /api/products/6a329151... → id = 6a329151...
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
// ============================================

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      images,
      category,
      brand,
      stock,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !brand) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    // Create product
    // createdBy = the admin who created it (from JWT token via protect middleware)
    const product = await Product.create({
      name,
      description,
      price,
      discountPrice: discountPrice || 0,
      images: images || [],
      category,
      brand,
      stock: stock || 0,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
// ============================================

const updateProduct = async (req, res, next) => {
  try {
    // Find product by ID
    let product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Update product with new data
    // { new: true } returns the updated product instead of old one
    // { runValidators: true } runs schema validators on update
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
// ============================================

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
// ============================================

const getProductsByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
};
