import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import toast from 'react-hot-toast';
import { processCheckout } from '../utils/paymentService';
import BkashLogo from '../components/BkashLogo';
import CashIcon from '../components/CashIcon';

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    phone: '',
    email: user?.email || '',
    saveInfo: false
  });

  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    try {
      setLoading(true);

      // Create order in Firebase
      const orderData = {
        userId: user.uid,
        items: items,
        total: getCartTotal(),
        shippingAddress: formData,
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: new Date(),
        orderNumber: `ORD-${Date.now()}`
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      if (paymentMethod === 'cash') {
        // Cash on delivery - order is confirmed
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order-confirmation/${orderRef.id}`);
      } else {
        // Process payment with UddoktaPay
        try {
          // Prepare enhanced checkout data
          const checkoutData = {
            orderId: orderRef.id,
            amount: getCartTotal(),
            customerInfo: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: `${formData.streetAddress}, ${formData.apartment}, ${formData.city}`.trim(),
              id: user.uid
            },
            items: items,
            orderReference: orderData.orderNumber
          };

          // Enhanced payment preferences
          const paymentPreferences = {
            apiVersion: 'v2', // Use enhanced API v2
            allowedPaymentMethods: ['bkash'], // Only allow bKash
            expiresInMinutes: 30, // Payment expires in 30 minutes
            customData: {
              order_type: 'ecommerce',
              customer_tier: 'standard',
              source: 'web_checkout',
              payment_method: paymentMethod
            }
          };

          const result = await processCheckout(checkoutData, paymentPreferences);

          if (result.success) {
            console.log(`Payment initiated using API ${result.api_version}`);
            // Redirect to payment gateway
            window.location.href = result.checkout_url || result.payment_url;
          } else {
            throw new Error(result.message || 'Failed to initiate payment');
          }
        } catch (paymentError) {
          console.error('Payment initiation error:', paymentError);
          toast.error('Failed to initiate payment. Please try again.');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 text-gray-600 mb-8">
        <Link to="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-black">Cart</Link>
        <span>/</span>
        <span className="text-black">Checkout</span>
      </div>

      <h1 className="text-3xl font-bold mb-8">Billing Details</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Billing Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apartment, floor, etc. (optional)
              </label>
              <input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Town/City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="saveInfo"
                checked={formData.saveInfo}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Save this information for faster check-out next time
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-6">Your Order</h3>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>৳{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-8">
                <h4 className="font-medium mb-4">Payment Method</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center space-x-2">
                      <BkashLogo className="w-8 h-8" />
                      <span className="font-medium">bKash</span>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center space-x-2">
                      <CashIcon className="w-8 h-8" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
