// File: backend/models/Product.js

const mongoose = require("mongoose");

// ============================================
// REVIEW SCHEMA (nested inside Product)
// ============================================

// Each product can have multiple reviews
// This is a sub-schema — it lives inside Product
const reviewSchema = new mongoose.Schema(
  {
    // Which user wrote this review
    user: {
      type: mongoose.Schema.Types.ObjectId, // reference to User collection
      required: true,
      ref: "User", // tells mongoose this ID belongs to User model
    },

    // Reviewer's name (stored here so we don't need to look up User every time)
    name: {
      type: String,
      required: true,
    },

    // Star rating 1-5
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review text
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// ============================================
// PRODUCT SCHEMA
// ============================================

const productSchema = new mongoose.Schema(
  {
    // Product name
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },

    // Product description
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // Product price in rupees
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },

    // Discounted price (optional)
    discountPrice: {
      type: Number,
      default: 0,
    },

    // Product images (array of URLs)
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],

    // Product category
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: [
        "Electronics",
        "Clothing",
        "Footwear",
        "Books",
        "Home & Kitchen",
        "Sports",
        "Toys",
        "Beauty",
        "Grocery",
        "Other",
      ],
    },

    // Brand name
    brand: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
    },

    // Stock quantity
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    // Reviews array (uses reviewSchema defined above)
    reviews: [reviewSchema],

    // Average rating (calculated from reviews)
    rating: {
      type: Number,
      default: 0,
    },

    // Total number of reviews
    numReviews: {
      type: Number,
      default: 0,
    },

    // Which admin added this product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Is product active/visible to customers
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
