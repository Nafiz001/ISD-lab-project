import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../utils/firebase';
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiUsers, FiBarChart2, FiImage, FiShoppingBag, FiFileText, FiTag } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import AddSlideModal from '../components/AddSlideModal';
import EditSlideModal from '../components/EditSlideModal';
import AddCategoryModal from '../components/AddCategoryModal';
import EditCategoryModal from '../components/EditCategoryModal';
import AboutAdmin from '../admin/AboutAdmin';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddSlideModal, setShowAddSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Check if user is admin
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);

      // Fetch carousel slides
      const slidesSnapshot = await getDocs(collection(db, 'carouselSlides'));
      const slidesData = slidesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCarouselSlides(slidesData.sort((a, b) => (a.order || 0) - (b.order || 0)));

      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          totalAmount: data.total || data.totalAmount || 0
        };
      });
      // Sort orders by creation date (newest first)
      setOrders(ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));

      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleProductUpdated = () => {
    fetchData();
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleProductAdded = () => {
    fetchData();
    setShowAddModal(false);
  };

  // Carousel slide management functions
  const handleDeleteSlide = async (slideId) => {
    try {
      await deleteDoc(doc(db, 'carouselSlides', slideId));
      toast.success('Slide deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    }
  };

  const handleAddSlide = async (slideData) => {
    try {
      await addDoc(collection(db, 'carouselSlides'), {
        ...slideData,
        createdAt: new Date()
      });
      toast.success('Slide added successfully!');
      fetchData();
      setShowAddSlideModal(false);
    } catch (error) {
      console.error('Error adding slide:', error);
      toast.error('Failed to add slide');
    }
  };

  const handleEditSlide = async (slideId, slideData) => {
    try {
      await updateDoc(doc(db, 'carouselSlides', slideId), slideData);
      toast.success('Slide updated successfully!');
      fetchData();
      setEditingSlide(null);
    } catch (error) {
      console.error('Error updating slide:', error);
      toast.error('Failed to update slide');
    }
  };

  // Category management functions
  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      toast.success('Category deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleAddCategory = async (categoryData) => {
    try {
      await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: new Date()
      });
      toast.success('Category added successfully!');
      fetchData();
      setShowAddCategoryModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleEditCategory = async (categoryId, categoryData) => {
    try {
      await updateDoc(doc(db, 'categories', categoryId), categoryData);
      toast.success('Category updated successfully!');
      fetchData();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  // Order management functions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      toast.success(`Order status updated to ${newStatus}`);
      fetchData(); // Refresh orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your e-commerce store</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4 sm:mb-8">
          <nav className="flex overflow-x-auto scrollbar-hide space-x-1 sm:space-x-6 border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'products'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiPackage className="inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">Items</span> ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'users'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiUsers className="inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span> ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'orders'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiShoppingBag className="inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Orders</span> ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'categories'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiTag className="inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Categories</span> ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('carousel')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'carousel'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiImage className="inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Carousel</span>
              <span className="sm:hidden">Slides</span> ({carouselSlides.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'analytics'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiBarChart2 className="inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'about'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiFileText className="inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">About Page</span>
              <span className="sm:hidden">About</span>
            </button>
          </nav>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold">Products Management</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <FiPlus className="mr-1 sm:mr-2" />
                Add Product
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Category
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Stock
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="ml-2 sm:ml-4 min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</div>
                              <div className="text-xs text-gray-500 truncate sm:hidden">{product.category}</div>
                              <div className="text-xs text-gray-500 truncate hidden sm:block">{product.description?.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                          {product.category}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          ৳{product.price}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                          {product.stock}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Users Management</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-medium text-gray-700">
                                  {user.email?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-2 sm:ml-4 min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.email}</div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isAdmin 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'Customer'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                          {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">Orders Management</h2>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Customer
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Items
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Payment
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            <div>
                              {order.orderNumber || order.id.substring(0, 8)}
                              <div className="sm:hidden text-xs text-gray-500 mt-1">
                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                            <div>
                              <div className="font-medium">
                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {order.shippingAddress?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                            {order.items?.length || 0} items
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            <div>
                              ৳{order.totalAmount?.toFixed(2)}
                              <div className="md:hidden text-xs text-gray-500 mt-1">
                                {order.items?.length || 0} items
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.paymentMethod === 'cash' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'bKash'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'confirmed'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'pending' ? 'Order Placed' :
                               order.status === 'confirmed' ? 'Order Confirmed' :
                               order.status === 'shipped' ? 'On The Way' :
                               order.status === 'delivered' ? 'Delivered' :
                               order.status === 'cancelled' ? 'Cancelled' :
                               'Order Placed'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                            {order.createdAt?.toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleUpdateOrderStatus(order.id, e.target.value);
                              }}
                              className="text-xs sm:text-sm border border-gray-300 rounded px-1 sm:px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="pending">Order Placed</option>
                              <option value="confirmed">Order Confirmed</option>
                              <option value="shipped">On The Way</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                        
                        {/* Expanded Order Details */}
                        {expandedOrder === order.id && (
                          <tr>
                            <td colSpan="8" className="px-3 sm:px-6 py-4 bg-gray-50">
                              <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Order Details</h4>
                                
                                {/* Customer Information */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2">Customer Information</h5>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p><strong>Name:</strong> {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                      <p><strong>Email:</strong> {order.shippingAddress?.email}</p>
                                      <p><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
                                      <p><strong>Address:</strong> {order.shippingAddress?.streetAddress}, {order.shippingAddress?.apartment}, {order.shippingAddress?.city}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2">Order Information</h5>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p><strong>Order ID:</strong> {order.id}</p>
                                      <p><strong>Order Number:</strong> {order.orderNumber}</p>
                                      <p><strong>Total Amount:</strong> ৳{order.totalAmount?.toFixed(2)}</p>
                                      <p><strong>Payment Method:</strong> {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'bKash'}</p>
                                      <p className="lg:hidden"><strong>Date:</strong> {order.createdAt?.toLocaleDateString() || 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Order Items */}
                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2">Items Ordered</h5>
                                  <div className="space-y-2">
                                    {order.items?.map((item, index) => (
                                      <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-2 bg-white rounded border">
                                        <img 
                                          src={item.image || item.imageUrl || '/placeholder-product.jpg'} 
                                          alt={item.name}
                                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <p className="font-medium text-gray-900">৳{(item.price * item.quantity).toFixed(2)}</p>
                                          <p className="text-sm text-gray-600">৳{item.price.toFixed(2)} each</p>
                                        </div>
                                      </div>
                                    )) || <p className="text-gray-500">No items found</p>}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No orders found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold">Categories Management</h2>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <FiPlus className="mr-1 sm:mr-2" />
                Add Category
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Slug
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Description
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Order
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {category.icon && (
                              <img
                                src={category.icon}
                                alt={category.name}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover flex-shrink-0 mr-2 sm:mr-4"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{category.name}</div>
                              <div className="text-xs text-gray-500 truncate sm:hidden">{category.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                          {category.slug}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                          <div className="max-w-xs truncate">
                            {category.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                          {category.order || 0}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit Category"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Category"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No categories found. Create your first category to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Carousel Tab */}
        {activeTab === 'carousel' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold">Carousel Management</h2>
              <button
                onClick={() => setShowAddSlideModal(true)}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <FiPlus className="mr-1 sm:mr-2" />
                Add Slide
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Link
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Order
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {carouselSlides.map((slide) => (
                      <tr key={slide.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="h-12 w-16 sm:h-16 sm:w-24 object-cover rounded"
                          />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{slide.title}</div>
                          <div className="text-xs text-gray-500 truncate">{slide.subtitle}</div>
                          <div className="sm:hidden text-xs text-gray-500 mt-1">Order: {slide.order || 0}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell truncate max-w-xs">
                          {slide.link}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                          {slide.order || 0}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingSlide(slide)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlide(slide.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Total Products</h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{products.length}</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Total Users</h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{users.length}</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Total Orders</h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{orders.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* About Page Tab */}
        {activeTab === 'about' && (
          <AboutAdmin />
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onProductAdded={handleProductAdded}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setShowEditModal(false)}
          onProductUpdated={handleProductUpdated}
        />
      )}

      {/* Add Slide Modal */}
      {showAddSlideModal && (
        <AddSlideModal
          onClose={() => setShowAddSlideModal(false)}
          onSlideAdded={handleAddSlide}
          products={products}
        />
      )}

      {/* Edit Slide Modal */}
      {editingSlide && (
        <EditSlideModal
          slide={editingSlide}
          onClose={() => setEditingSlide(null)}
          onSlideUpdated={handleEditSlide}
          products={products}
        />
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <AddCategoryModal
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          onAdd={handleAddCategory}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          isOpen={!!editingCategory}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onEdit={handleEditCategory}
        />
      )}
    </div>
  );
};

export default AdminPanel;
