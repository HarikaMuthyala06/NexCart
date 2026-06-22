// File: frontend/src/pages/CartPage.jsx

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      setCart(response.data.cart);
    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await api.put(`/cart/${productId}`, { quantity });
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      fetchCart();
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    try {
      await api.delete("/cart");
      fetchCart();
    } catch (err) {
      alert("Failed to clear cart");
    }
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!cart || cart.items?.length === 0)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Your cart is empty!
        </h2>
        <p className="text-gray-500 mb-6">Add some products to your cart</p>
        <Link
          to="/"
          className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
        >
          Shop Now
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🛒 My Cart ({cart.items?.length} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items?.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow p-4 flex gap-4"
            >
              <img
                src={item.image || "https://via.placeholder.com/100"}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-orange-500 font-bold text-lg">
                  ₹{item.price?.toLocaleString()}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(
                        item.product?._id || item.product,
                        item.quantity - 1,
                      )
                    }
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 bg-gray-100 rounded-full font-bold hover:bg-gray-200 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="font-semibold w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(
                        item.product?._id || item.product,
                        item.quantity + 1,
                      )
                    }
                    className="w-8 h-8 bg-gray-100 rounded-full font-bold hover:bg-gray-200"
                  >
                    +
                  </button>
                  <span className="text-gray-500 text-sm ml-2">
                    = ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ✅ Fixed Remove Button */}
              <button
                onClick={() => handleRemove(item.product?._id || item.product)}
                className="text-red-400 hover:text-red-600 transition text-xl"
              >
                🗑️
              </button>
            </div>
          ))}

          <button
            onClick={handleClearCart}
            className="text-red-500 hover:underline text-sm"
          >
            Clear entire cart
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-gray-600">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span>₹{cart.totalPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">
                {cart.totalPrice > 500 ? "FREE" : "₹50"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>
                ₹{Math.round(cart.totalPrice * 0.18).toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-800">
              <span>Total</span>
              <span className="text-orange-500">
                ₹
                {(
                  cart.totalPrice +
                  (cart.totalPrice > 500 ? 0 : 50) +
                  Math.round(cart.totalPrice * 0.18)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          {/* ✅ Fixed Checkout Route */}
          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold mt-6 hover:bg-orange-600 transition"
          >
            Proceed to Checkout →
          </button>

          <Link
            to="/"
            className="block text-center text-orange-500 hover:underline mt-3 text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
