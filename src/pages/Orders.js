import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';
import { FiPackage, FiCalendar, FiDollarSign, FiTruck, FiClock, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching orders for user:', user.uid);
        
        // Try simple query first
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(ordersQuery);
        console.log('Query snapshot size:', querySnapshot.size);
        
        let ordersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Order data:', data);
          
          let createdAt = new Date();
          
          // Handle different createdAt formats
          if (data.createdAt) {
            if (data.createdAt.toDate) {
              // Firestore Timestamp
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              // JavaScript Date
              createdAt = data.createdAt;
            } else if (typeof data.createdAt === 'string') {
              // String date
              createdAt = new Date(data.createdAt);
            }
          }

          return {
            id: doc.id,
            ...data,
            createdAt: createdAt,
            totalAmount: data.total || data.totalAmount || 0
          };
        }).filter(order => !order.deletedByCustomer); // Filter out orders deleted by customer

        // Sort manually by creation date
        ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log('Processed orders:', ordersData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          user: user?.uid
        });
        setError(`Failed to load orders: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <FiTruck className="w-5 h-5 text-blue-600" />;
      case 'confirmed':
        return <FiClock className="w-5 h-5 text-yellow-600" />;
      case 'pending':
      default:
        return <FiPackage className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'confirmed':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'pending':
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Order Confirmed';
      case 'shipped':
        return 'On The Way';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Order Placed';
    }
  };

  const handleCancelOrder = async (orderId, orderNumber) => {
    // Show confirmation dialog
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel order #${orderNumber}? This action cannot be undone.`
    );
    
    if (!confirmCancel) return;

    try {
      // Update order status to cancelled
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      });

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );

      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to remove order #${orderNumber} from your order history? This will hide it from your view but admin records will be preserved.`
    );
    
    if (!confirmDelete) return;

    try {
      // Mark order as deleted by customer instead of actually deleting it
      await updateDoc(doc(db, 'orders', orderId), {
        deletedByCustomer: true,
        deletedAt: new Date()
      });

      // Update local state to remove the order from customer view
      setOrders(prevOrders => 
        prevOrders.filter(order => order.id !== orderId)
      );

      toast.success('Order removed from your history successfully');
    } catch (error) {
      console.error('Error removing order:', error);
      toast.error('Failed to remove order. Please try again.');
    }
  };

  const handleShowOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

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
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
              <p className="text-gray-600">Track and manage your orders</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">When you place orders, they will appear here.</p>
            <a 
              href="/products" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                      <div className="text-sm text-gray-600">
                        Order #{order.orderNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {order.createdAt.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="w-4 h-4" />
                        ৳{order.totalAmount?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <img 
                          src={item.image || item.imageUrl || '/placeholder-product.jpg'} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">৳{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-gray-600 text-sm">৳{item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Payment Method:</strong> {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'bKash'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Delivery Address:</strong> {order.customerInfo?.address || order.shippingAddress?.streetAddress ? 
                            `${order.shippingAddress?.streetAddress}, ${order.shippingAddress?.apartment}, ${order.shippingAddress?.city}`.replace(/^, |, $/, '') : 
                            'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold text-gray-800">৳{order.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link 
                      to={`/track-order/${order.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Track Order
                    </Link>
                    {(order.status?.toLowerCase() === 'pending') && (
                      <button 
                        onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Cancel Order
                      </button>
                    )}
                    {(order.status?.toLowerCase() === 'cancelled') && (
                      <button 
                        onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                      >
                        <FiTrash2 size={16} />
                        Remove from History
                      </button>
                    )}
                    <button 
                      onClick={() => handleShowOrderDetails(order)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Order Details
                    </button>
                  </div>

                  {/* Cancelled Order Notice */}
                  {(order.status?.toLowerCase() === 'cancelled') && (
                    <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            <strong>Order Cancelled:</strong> This order has been cancelled and will not be processed. 
                            You can remove it from your order history (admin records will be preserved for business purposes).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={handleCloseOrderDetails}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {selectedOrder.customerInfo?.name || selectedOrder.shippingAddress?.firstName + ' ' + selectedOrder.shippingAddress?.lastName || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerInfo?.email || selectedOrder.shippingAddress?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerInfo?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedOrder.customerInfo?.address || 
                    `${selectedOrder.shippingAddress?.streetAddress || ''}, ${selectedOrder.shippingAddress?.apartment || ''}, ${selectedOrder.shippingAddress?.city || ''}`.replace(/^, |, $/, '') || 'N/A'}</p>
                </div>
              </div>

              {/* Order Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
                  <p><strong>Total Amount:</strong> ৳{selectedOrder.totalAmount?.toFixed(2) || selectedOrder.total?.toFixed(2) || '0.00'}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : selectedOrder.paymentMethod || 'N/A'}</p>
                  <p><strong>Order Date:</strong> {selectedOrder.createdAt?.toLocaleDateString() || 'N/A'}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status?.toLowerCase() === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : 'Pending'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div>
                          <p className="font-medium">{item.name || item.title}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCloseOrderDetails}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;