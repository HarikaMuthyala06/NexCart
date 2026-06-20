// File: backend/models/Order.js

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Which user placed this order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Items that were ordered
    // (snapshot of cart at time of order)
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    // Delivery address
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },

    // Payment information
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "Online"], // Cash on Delivery or Online Payment
      default: "COD",
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    // Payment details (filled when online payment is made)
    paymentResult: {
      id: { type: String },
      status: { type: String },
      updateTime: { type: String },
      email: { type: String },
    },

    // Price breakdown
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },

    // Order status tracking
    orderStatus: {
      type: String,
      enum: [
        "Processing", // order placed, being prepared
        "Shipped", // order sent for delivery
        "Delivered", // order received by customer
        "Cancelled", // order cancelled
      ],
      default: "Processing",
    },

    // Timestamps for tracking
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true, // createdAt = order placed time
  },
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
