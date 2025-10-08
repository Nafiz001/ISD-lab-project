import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { FiArrowLeft, FiPackage, FiCheckCircle, FiTruck, FiHome, FiClock, FiTrash2 } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order status progression
  const statusFlow = [
    { 
      key: 'pending', 
      label: 'Order Placed', 
      icon: FiPackage,
      description: 'Your order has been received and is being processed'
    },
    { 
      key: 'confirmed', 
      label: 'Order Confirmed', 
      icon: FiCheckCircle,
      description: 'Your order has been confirmed and is being prepared'
    },
    { 
      key: 'shipped', 
      label: 'On The Way', 
      icon: FiTruck,
      description: 'Your order is on its way to your delivery address'
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      icon: FiHome,
      description: 'Your order has been successfully delivered'
    }
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          
          // Check if order was deleted by customer
          if (orderData.deletedByCustomer) {
            setError('Order not found');
            return;
          }
          
          let createdAt = new Date();
          
          // Handle different createdAt formats
          if (orderData.createdAt) {
            if (orderData.createdAt.toDate) {
              createdAt = orderData.createdAt.toDate();
            } else if (orderData.createdAt instanceof Date) {
              createdAt = orderData.createdAt;
            } else if (typeof orderData.createdAt === 'string') {
              createdAt = new Date(orderData.createdAt);
            }
          }

          setOrder({
            id: orderDoc.id,
            ...orderData,
            createdAt: createdAt
          });
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

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getCurrentStatusIndex = (currentStatus) => {
    return statusFlow.findIndex(status => 
      status.key === currentStatus?.toLowerCase()
    );
  };

  const isStatusCompleted = (statusIndex, currentStatus) => {
    const currentIndex = getCurrentStatusIndex(currentStatus);
    return currentIndex >= statusIndex;
  };

  const isStatusActive = (statusIndex, currentStatus) => {
    const currentIndex = getCurrentStatusIndex(currentStatus);
    return currentIndex === statusIndex;
  };

  const getEstimatedDelivery = (createdAt, status) => {
    if (!createdAt) return 'N/A';
    
    const orderDate = new Date(createdAt);
    let daysToAdd = 7; // Default 7 days
    
    switch (status?.toLowerCase()) {
      case 'pending':
        daysToAdd = 7;
        break;
      case 'confirmed':
        daysToAdd = 5;
        break;
      case 'shipped':
        daysToAdd = 2;
        break;
      case 'delivered':
        return 'Delivered';
      default:
        daysToAdd = 7;
    }
    
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    
    return estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel order #${order.orderNumber}? This action cannot be undone.`
    );
    
    if (!confirmCancel) return;

    try {
      setLoading(true);
      
      // Update order status to cancelled
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      });

      // Update local state
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
      
      toast.success('Order cancelled successfully');
      
      // Navigate back to orders page after a short delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderIdToDelete, orderNumber) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove order #${orderNumber} from your order history? This will hide it from your view but admin records will be preserved.`
    );
    
    if (!confirmDelete) return;

    try {
      setLoading(true);
      
      // Mark order as deleted by customer instead of actually deleting it
      await updateDoc(doc(db, 'orders', orderIdToDelete), {
        deletedByCustomer: true,
        deletedAt: new Date()
      });
      
      toast.success('Order removed from your history successfully');
      
      // Navigate back to orders page
      navigate('/orders');
      
    } catch (error) {
      console.error('Error removing order:', error);
      toast.error('Failed to remove order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Order not found'}</div>
          <Link 
            to="/orders" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/orders" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
              <p className="text-sm text-gray-600">Order Date: {order.createdAt.toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Total: ৳{order.totalAmount?.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Payment: {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'bKash'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
              <p className="text-sm text-gray-600">
                {order.customerInfo?.name || order.shippingAddress?.firstName + ' ' + order.shippingAddress?.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {order.customerInfo?.address || 
                 `${order.shippingAddress?.streetAddress}, ${order.shippingAddress?.apartment}, ${order.shippingAddress?.city}`.replace(/^, |, $/, '') ||
                 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {order.customerInfo?.phone || order.shippingAddress?.phone || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Estimated Delivery</h3>
              <p className="text-sm text-gray-600">{getEstimatedDelivery(order.createdAt, order.status)}</p>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status?.toLowerCase() === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Progress Tracking */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Progress</h2>
          
          {/* Cancelled Order Display */}
          {order.status?.toLowerCase() === 'cancelled' ? (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-red-600 mb-2">Order Cancelled</h3>
              <p className="text-gray-600 mb-4">
                This order has been cancelled and will not be processed further.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-6">
                <p><strong>Cancellation Date:</strong> {order.cancelledAt ? new Date(order.cancelledAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                <p className="mt-1">If you were charged for this order, any applicable refunds will be processed within 3-5 business days.</p>
              </div>
              
              {/* Delete Order Button */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Remove Order from History</h4>
                <p className="text-sm text-gray-600 mb-4">
                  You can remove this cancelled order from your order history. Admin records will be preserved for business purposes.
                </p>
                <button
                  onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <FiTrash2 size={16} />
                  Remove from History
                </button>
              </div>
            </div>
          ) : (
            /* Normal Progress Tracking */
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gray-200"></div>
              <div 
                className="absolute left-8 top-8 w-0.5 bg-green-500 transition-all duration-500"
                style={{ 
                  height: currentStatusIndex >= 0 ? 
                    `${((currentStatusIndex + 1) / statusFlow.length) * 100}%` : '0%' 
                }}
              ></div>

              {/* Status Steps */}
              <div className="space-y-8">
                {statusFlow.map((status, index) => {
                  const IconComponent = status.icon;
                  const isCompleted = isStatusCompleted(index, order.status);
                  const isActive = isStatusActive(index, order.status);
                  
                  return (
                    <div key={status.key} className="relative flex items-start">
                      {/* Status Icon */}
                      <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isActive
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {isCompleted && !isActive ? (
                          <FiCheckCircle className="w-6 h-6" />
                        ) : isActive ? (
                          <FiClock className="w-6 h-6" />
                        ) : (
                          <IconComponent className="w-6 h-6" />
                        )}
                      </div>

                      {/* Status Content */}
                      <div className="ml-6 flex-1">
                        <h3 className={`text-lg font-semibold ${
                          isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {status.label}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {status.description}
                        </p>
                        {isActive && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Current Status
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <img 
                  src={item.image || item.imageUrl || '/placeholder-product.jpg'} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                  <p className="text-gray-600 text-sm">Price: ৳{item.price?.toFixed(2)} each</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">৳{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Total */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
              <span className="text-xl font-bold text-gray-900">৳{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Cancel Order Section */}
          {order.status?.toLowerCase() === 'pending' && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Order Cancellation:</strong> You can cancel this order since it hasn't been confirmed yet. 
                      Once confirmed, cancellation will not be possible.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cancel Order
              </button>
            </div>
          )}

          {/* Order Status Message for Non-Cancellable Orders */}
          {order.status?.toLowerCase() !== 'pending' && order.status?.toLowerCase() !== 'cancelled' && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Order Status:</strong> Your order has been confirmed and is being processed. 
                      Cancellation is no longer available at this stage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
