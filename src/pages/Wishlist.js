import React from 'react';
import { FiHeart, FiShoppingCart, FiTrash2, FiEye } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();

  const addToCartFromWishlist = (item) => {
    addToCart(item);
    toast.success('Added to cart');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Please sign in</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to view your wishlist.</p>
            <Link 
              to="/login" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiHeart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
                <p className="text-gray-600">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>
            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you like to your wishlist. Review them anytime and easily move them to your cart.</p>
            <Link 
              to="/products" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative group bg-white border-b border-gray-200">
                  <img 
                    src={item.image || item.imageUrl || '/placeholder-product.jpg'} 
                    alt={item.name}
                    className="w-full h-48 object-contain"
                  />
                  
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link
                      to={`/product/${item.id}`}
                      className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => addToCartFromWishlist(item)}
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                      title="Add to Cart"
                    >
                      <FiShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove Button (always visible on mobile) */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 bg-white text-red-600 p-1.5 rounded-full shadow-md hover:bg-red-50 transition-colors sm:hidden"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {item.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-800">৳{item.price}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">৳{item.originalPrice}</span>
                      )}
                    </div>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    {item.stock > 0 ? (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        In Stock ({item.stock} available)
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCartFromWishlist(item)}
                      disabled={item.stock === 0}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="bg-gray-200 text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-sm hidden sm:block"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Tips */}
        {wishlistItems.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Wishlist Tips</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Items in your wishlist are saved for 90 days</li>
              <li>• Share your wishlist with friends and family</li>
              <li>• Get notified when prices drop on wishlist items</li>
              <li>• Easily move items to your cart when you're ready to buy</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;