// File: backend/controllers/orderController.js

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ============================================
// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
// ============================================

const placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Validate shipping address
    if (!shippingAddress) {
      res.status(400);
      throw new Error("Shipping address is required");
    }

    const { street, city, state, pincode, phone } = shippingAddress;

    if (!street || !city || !state || !pincode || !phone) {
      res.status(400);
      throw new Error("Please provide complete shipping address");
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price discountPrice images stock isActive",
    );

    // Check if cart exists and has items
    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error("Your cart is empty");
    }

    // Check stock availability for all items
    for (const item of cart.items) {
      const product = item.product;

      if (!product.isActive) {
        res.status(400);
        throw new Error(`${product.name} is no longer available`);
      }

      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(
          `Only ${product.stock} units of ${product.name} available`,
        );
      }
    }

    // Build order items from cart
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    }));

    // Calculate prices
    const itemsPrice = cart.totalPrice;

    // Shipping is free above ₹500
    const shippingPrice = itemsPrice > 500 ? 0 : 50;

    // 18% GST
    const taxPrice = Math.round(itemsPrice * 0.18);

    // Total price
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: "Processing",
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear the cart after order placed
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
// ============================================

const getMyOrders = async (req, res, next) => {
  try {
    // Find all orders for logged in user
    // Sort by newest first
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
// ============================================

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Make sure logged in user owns this order
    // OR user is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
// ============================================

const getAllOrders = async (req, res, next) => {
  try {
    // Get all orders with user details
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Calculate total revenue
    const totalRevenue = orders.reduce((acc, order) => {
      return acc + order.totalPrice;
    }, 0);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalRevenue,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
// ============================================

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    // Validate status
    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(orderStatus)) {
      res.status(400);
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    // Find order
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Update status
    order.orderStatus = orderStatus;

    // If delivered, set deliveredAt timestamp
    if (orderStatus === "Delivered") {
      order.deliveredAt = Date.now();
      order.paymentStatus = "Paid";
      order.paidAt = Date.now();
    }

    // If cancelled, restore product stock
    if (orderStatus === "Cancelled") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
