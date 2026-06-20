// File: backend/routes/orderRoutes.js

const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/authMiddleware");

// ============================================
// USER ROUTES
// ============================================

// Place new order
router.post("/", protect, placeOrder);

// Get my orders
// ⚠️ /myorders MUST come before /:id
// Otherwise 'myorders' gets treated as an ID
router.get("/myorders", protect, getMyOrders);

// Get single order
router.get("/:id", protect, getOrderById);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all orders
router.get("/", protect, admin, getAllOrders);

// Update order status
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
