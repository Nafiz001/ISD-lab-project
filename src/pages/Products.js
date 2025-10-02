import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'computer-accessories', label: 'Computer Accessories' },
    { value: 'audio-sound', label: 'Audio & Sound' },
    { value: 'smart-devices', label: 'Smart Devices' },
    { value: 'power-storage', label: 'Power & Storage' },
    { value: 'home-appliances', label: 'Home Appliances' },
    { value: 'gaming', label: 'Gaming' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [sortBy, filterBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let q;
      
      if (filterBy === 'all') {
        q = query(collection(db, 'products'));
      } else {
        q = query(
          collection(db, 'products'), 
          where('category', '==', filterBy)
        );
      }

      const querySnapshot = await getDocs(q);
      let productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort in memory to avoid Firestore composite index requirements
      if (productsData.length > 0) {
        productsData = productsData.sort((a, b) => {
          const field = getSortField();
          const direction = getSortDirection();
          
          let aValue = a[field] || '';
          let bValue = b[field] || '';
          
          // Handle different data types
          if (field === 'price') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
          } else if (field === 'rating') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
          } else if (field === 'createdAt') {
            aValue = aValue?.toDate?.() || new Date(0);
            bValue = bValue?.toDate?.() || new Date(0);
          } else {
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();
          }
          
          if (direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortField = () => {
    switch (sortBy) {
      case 'price-low': return 'price';
      case 'price-high': return 'price';
      case 'rating': return 'rating';
      case 'newest': return 'createdAt';
      default: return 'name';
    }
  };

  const getSortDirection = () => {
    switch (sortBy) {
      case 'price-high': return 'desc';
      case 'rating': return 'desc';
      case 'newest': return 'desc';
      default: return 'asc';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">All Products</h1>
        
        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-6">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
          {filterBy !== 'all' && ` in ${categories.find(c => c.value === filterBy)?.label}`}
        </p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
