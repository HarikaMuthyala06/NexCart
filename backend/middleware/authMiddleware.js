// File: backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================
// PROTECT MIDDLEWARE
// Checks if user is logged in via JWT token
// ============================================

const protect = async (req, res, next) => {
  try {
    let token;

    // JWT token is sent in the Authorization header
    // Format: "Bearer eyJhbGciOiJIUzI1NiIs..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }

    // Verify the token
    // jwt.verify() decodes the token and checks if it's valid
    // If token is expired or tampered, it throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database using ID stored in token
    // We use .select('-password') to exclude password from result
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    // Call next() to continue to the actual route handler
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.status(401);
      error.message = "Not authorized, invalid token";
    }
    if (error.name === "TokenExpiredError") {
      res.status(401);
      error.message = "Not authorized, token expired";
    }
    next(error);
  }
};

// ============================================
// ADMIN MIDDLEWARE
// Checks if logged in user is an admin
// Always use AFTER protect middleware
// ============================================

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // user is admin, continue
  } else {
    res.status(403);
    next(new Error("Not authorized as admin"));
  }
};

module.exports = { protect, admin };
