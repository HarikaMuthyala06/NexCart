// File: backend/models/Cart.js

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    // Which user owns this cart
    // Each user has only ONE cart
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },

    // Array of items in the cart
    items: [
      {
        // Which product
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        // How many of this product
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },

        // Price at the time of adding to cart
        // (stored separately because product price might change later)
        price: {
          type: Number,
          required: true,
        },

        // Product name (stored for quick display)
        name: {
          type: String,
          required: true,
        },

        // Product image (stored for quick display)
        image: {
          type: String,
          required: true,
        },
      },
    ],

    // Total price of all items in cart
    // This is calculated and updated whenever cart changes
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================
// METHOD — Calculate total price
// ============================================

// This method recalculates total whenever we call it
cartSchema.methods.calculateTotal = function () {
  this.totalPrice = this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
