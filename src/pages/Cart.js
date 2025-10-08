import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          
          <Link
            to="/"
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 text-gray-600 mb-8">
        <Link to="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <span className="text-black">Cart</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 font-semibold text-sm">
              <span>Product</span>
              <span className="text-center">Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-center">Subtotal</span>
            </div>

            {/* Cart Items */}
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                  {/* Product Info */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>

                  {/* Price */}
                  <div className="text-center">
                    <span className="font-semibold">৳{item.price}</span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="px-3 py-2 min-w-[50px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-center">
                    <span className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <Link
              to="/"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Return To Shop
            </Link>
            <button
              onClick={handleClearCart}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-6">Cart Total</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">৳{getCartTotal().toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>৳{getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors mt-6 block text-center"
            >
              Proceed to checkout
            </Link>
          </div>

          {/* Coupon Code */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Coupon Code</h3>
            <div className="flex">
              <input
                type="text"
                placeholder="Coupon Code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-red-500"
              />
              <button className="px-4 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
