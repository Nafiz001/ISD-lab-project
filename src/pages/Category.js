import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';

const Category = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');

  const categoryLabels = {
    'computer-accessories': 'Computer Accessories',
    'audio-sound': 'Audio & Sound',
    'smart-devices': 'Smart Devices',
    'power-storage': 'Power & Storage',
    'home-appliances': 'Home Appliances',
    'gaming': 'Gaming',
    'mobile-phone': 'Mobile Phones',
    'smartwatch': 'Smart Watches',
    'camera': 'Cameras',
    'headphones': 'Headphones'
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for category:', category);
      
      // Simple query without ordering first to test
      const q = query(
        collection(db, 'products'), 
        where('category', '==', category)
      );

      const querySnapshot = await getDocs(q);
      let productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Found products:', productsData.length);
      console.log('Products data:', productsData);

      // Sort in memory
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

  const getCategoryLabel = () => {
    return categoryLabels[category] || category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{getCategoryLabel()}</h1>
        <p className="text-gray-600 mb-6">
          Browse our collection of {getCategoryLabel().toLowerCase()}
        </p>
        
        {/* Sorting */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
          
          <div className="w-48">
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
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">
            We don't have any products in the {getCategoryLabel().toLowerCase()} category yet.
          </p>
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

export default Category;
