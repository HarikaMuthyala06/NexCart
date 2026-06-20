// File: backend/routes/cartRoutes.js

const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// All cart routes require login
// protect middleware runs on ALL routes below

// GET    /api/cart          → view cart
// POST   /api/cart          → add item
// DELETE /api/cart          → clear cart
router
  .route("/")
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

// PUT    /api/cart/:productId  → update quantity
// DELETE /api/cart/:productId  → remove item
router
  .route("/:productId")
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

module.exports = router;
