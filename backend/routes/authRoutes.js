// File: backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getAllUsers,
} = require("../controllers/authController");

const { protect, admin } = require("../middleware/authMiddleware");

// ============================================
// PUBLIC ROUTES
// ============================================
router.post("/register", registerUser);
router.post("/login", loginUser);

// ============================================
// PRIVATE ROUTES (login required)
// ============================================
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/logout", protect, logoutUser);

// ============================================
// ADMIN ONLY ROUTES
// protect runs first → then admin
// Both middlewares must pass
// ============================================
router.get("/admin/users", protect, admin, getAllUsers);

module.exports = router;
