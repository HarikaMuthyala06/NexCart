// File: backend/controllers/cartController.js

const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ============================================
// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (must be logged in)
// ============================================

const getCart = async (req, res, next) => {
  try {
    // Find cart belonging to logged in user
    // populate('items.product') fills in product details
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock isActive",
    );

    // If no cart exists, return empty cart
    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          totalPrice: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
// ============================================

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate input
    if (!productId) {
      res.status(400);
      throw new Error("Product ID is required");
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      res.status(400);
      throw new Error("Product is not available");
    }

    // Check if enough stock available
    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    // Find existing cart or create new one
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart for user
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemIndex > -1) {
      // Product already in cart → update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check stock for new quantity
      if (product.stock < newQuantity) {
        res.status(400);
        throw new Error(`Only ${product.stock} items available in stock`);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Product not in cart → add new item
      cart.items.push({
        product: productId,
        quantity,
        price:
          product.discountPrice > 0 ? product.discountPrice : product.price,
        name: product.name,
        image: product.images[0]?.url || "",
      });
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Save cart
    await cart.save();

    // Return updated cart with product details
    cart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images stock",
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
// ============================================

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    // Validate quantity
    if (!quantity || quantity < 1) {
      res.status(400);
      throw new Error("Quantity must be at least 1");
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      res.status(404);
      throw new Error("Item not found in cart");
    }

    // Check stock
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Only ${product.stock} items available`);
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Recalculate total
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
// ============================================

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    // Remove item from cart
    // filter() keeps all items EXCEPT the one we want to remove
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    // Recalculate total
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
// ============================================

const clearCart = async (req, res, next) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    // Empty the items array
    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
