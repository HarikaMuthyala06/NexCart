// File: frontend/src/components/ProductCard.jsx

import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const discount =
    product.discountPrice > 0
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100,
        )
      : 0;

  return (
    <Link to={`/product/${product._id}`}>
      <div className="bg-white rounded-xl shadow hover:shadow-lg transition duration-300 overflow-hidden group">
        {/* Product Image */}
        <div className="relative overflow-hidden h-56 bg-gray-100">
          <img
            src={
              product.images[0]?.url || "https://via.placeholder.com/300x200"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-orange-500">
              ₹
              {product.discountPrice > 0
                ? product.discountPrice
                : product.price}
            </span>
            {product.discountPrice > 0 && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600">
              {product.rating || 0} ({product.numReviews || 0} reviews)
            </span>
          </div>

          {/* Stock */}
          {product.stock === 0 && (
            <p className="text-red-500 text-sm mt-1">Out of Stock</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
