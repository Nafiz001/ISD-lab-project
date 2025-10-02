import React, { useState } from 'react';
import { FiHeart, FiEye, FiStar } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product, showDiscount = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [showQuickView, setShowQuickView] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigation when clicking add to cart
    addToCart(product);
    toast.success('Product added to cart!');
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const discountPercentage = showDiscount && product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <div className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* Discount Badge */}
        {showDiscount && discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
            -{discountPercentage}%
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button 
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors ${
              isInWishlist(product.id) 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-700'
            }`}
            title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart size={16} className={isInWishlist(product.id) ? 'fill-current' : ''} />
          </button>
          <button 
            onClick={handleQuickView}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors text-gray-700"
            title="Quick view"
          >
            <FiEye size={16} />
          </button>
        </div>

        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg bg-white border-b border-gray-200 h-48">
          <img
            src={product.image || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 bg-black text-white py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-800"
          >
            Add To Cart
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 flex-1">{product.name}</h3>
          
          {/* Price */}
          <div className="flex items-center space-x-2 mb-2 mt-auto">
            <span className="text-red-500 font-semibold">Tk {product.price}</span>
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-sm">Tk {product.originalPrice}</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className={`${
                    i < (product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500 text-sm">({product.reviews || 0})</span>
          </div>

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              {product.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={(e) => e.preventDefault()}
                  className="w-4 h-4 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
