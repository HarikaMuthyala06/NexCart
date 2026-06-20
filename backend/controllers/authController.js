// File: backend/controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ============================================
// HELPER — Generate JWT Token
// ============================================

// This function creates a JWT token for a user
// We call this after register and login
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // payload — data stored inside token
    process.env.JWT_SECRET, // secret key — used to sign the token
    { expiresIn: process.env.JWT_EXPIRE }, // token expires in 30 days
  );
};

// ============================================
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (anyone can register)
// ============================================

const registerUser = async (req, res, next) => {
  try {
    // Step 1: Get data from request body
    // When frontend sends a form, data comes in req.body
    const { name, email, password } = req.body;

    // Step 2: Validate input
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email and password");
    }

    // Step 3: Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    // Step 4: Create new user
    // Password gets hashed automatically by our User model middleware
    const user = await User.create({
      name,
      email,
      password,
    });

    // Step 5: Generate JWT token
    const token = generateToken(user._id);

    // Step 6: Send response
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error); // pass error to errorHandler middleware
  }
};

// ============================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ============================================

const loginUser = async (req, res, next) => {
  try {
    // Step 1: Get email and password from request
    const { email, password } = req.body;

    // Step 2: Validate input
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    // Step 3: Find user by email
    // We use .select('+password') because password has select:false in schema
    // select:false means password is never returned by default
    // +password means "include password this one time"
    const user = await User.findOne({ email }).select("+password");

    // Step 4: Check if user exists
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // Step 5: Check if password matches
    // matchPassword is the method we defined in User.js
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // Step 6: Generate JWT token
    const token = generateToken(user._id);

    // Step 7: Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private (must be logged in)
// ============================================

const getUserProfile = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware after verifying token
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// ============================================

const updateUserProfile = async (req, res, next) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Update only the fields that were sent
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.avatar = req.body.avatar || user.avatar;

    // Update address if provided
    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address.street,
        city: req.body.address.city || user.address.city,
        state: req.body.address.state || user.address.state,
        pincode: req.body.address.pincode || user.address.pincode,
      };
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
      // password will be re-hashed by User.js pre-save middleware
    }

    // Save updated user
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
// ============================================

const logoutUser = async (req, res, next) => {
  try {
    // JWT is stateless — we can't destroy it on server side
    // The frontend just deletes the token from storage
    // We just send a success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Get all users (Admin only)
// @route   GET /api/auth/admin/users
// @access  Private/Admin
// ============================================

const getAllUsers = async (req, res, next) => {
  try {
    // Find ALL users in database
    // Admin can see everyone
    const users = await User.find({});

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};
// Export all functions
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getAllUsers,
};
