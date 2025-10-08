import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { FiCheckCircle, FiPackage, FiHome, FiCalendar, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          setError('Order ID not found');
          return;
        }

        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <FiHome className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We've received your request and will process it soon.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-lg font-mono font-bold text-gray-800">{order?.orderNumber}</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiPackage className="w-5 h-5" />
            Order Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiUser className="w-4 h-4" />
                  <span>{order?.customerInfo?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPhone className="w-4 h-4" />
                  <span>{order?.customerInfo?.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <FiMapPin className="w-4 h-4 mt-0.5" />
                  <span>{order?.customerInfo?.address}</span>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Order Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar className="w-4 h-4" />
                  <span>{new Date(order?.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{order?.paymentMethod === 'cash' ? 'Cash on Delivery' : 'bKash'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-orange-600 font-medium">{order?.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order?.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">৳{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                <span>Total Amount:</span>
                <span>৳{order?.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-800 mb-3">What's Next?</h2>
          <div className="space-y-2 text-blue-700">
            <p>• We'll contact you within 24 hours to confirm your order</p>
            <p>• Your order will be prepared and shipped within 2-3 business days</p>
            {order?.paymentMethod === 'cash' && (
              <p>• Please keep the exact amount ready for cash on delivery</p>
            )}
            <p>• You'll receive updates via SMS and email</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Continue Shopping
          </Link>
          <Link 
            to="/products" 
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;