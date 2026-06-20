// File: backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");

// ============================================
// PUBLIC ROUTES
// ============================================

// Get all products (with search, filter, pagination)
router.get("/", getProducts);

// Get products by category
router.get("/category/:category", getProductsByCategory);

// Get single product by ID
// ⚠️ This must come AFTER /category/:category
// Otherwise 'category' would be treated as an ID
router.get("/:id", getProductById);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// Create new product
router.post("/", protect, admin, createProduct);

// Update product
router.put("/:id", protect, admin, updateProduct);

// Delete product
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
