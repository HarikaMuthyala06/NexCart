// File: frontend/src/pages/ProductPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setAdding(true);
      await api.post("/cart", {
        productId: product._id,
        quantity,
      });
      setMessage("✅ Added to cart successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(
        "❌ " + (err.response?.data?.message || "Failed to add to cart"),
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-xl text-gray-600">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg"
        >
          Go Home
        </button>
      </div>
    );

  const discount =
    product.discountPrice > 0
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100,
        )
      : 0;

  const finalPrice =
    product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="text-orange-500 hover:underline mb-6 flex items-center gap-1"
      >
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
          <img
            src={product.images[0]?.url || "https://via.placeholder.com/500"}
            alt={product.name}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          {/* Brand & Category */}
          <div className="flex gap-2">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
              {product.brand}
            </span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              {product.category}
            </span>
          </div>

          {/* Name */}
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xl">★</span>
            <span className="text-gray-600">
              {product.rating || 0} ({product.numReviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-orange-500">
              ₹{finalPrice.toLocaleString()}
            </span>
            {discount > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm font-medium">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <p className="text-green-600 font-medium">
                ✅ In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-500 font-medium">❌ Out of Stock</p>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Success/Error Message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold text-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "🛒 Add to Cart"}
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="px-6 py-3 border-2 border-orange-500 text-orange-500 rounded-xl font-semibold hover:bg-orange-50 transition"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
