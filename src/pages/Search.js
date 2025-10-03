import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiInfo } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, loading } = useProducts();
  const { searchProducts, getSpellingSuggestions } = useAdvancedSearch(products);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState('all');
  const [spellingSuggestions, setSpellingSuggestions] = useState([]);

  useEffect(() => {
    if (!query || !products.length) {
      setFilteredProducts([]);
      setSpellingSuggestions([]);
      return;
    }

    // Use advanced search with spell correction
    let filtered = searchProducts(query);
    
    // Get spelling suggestions if no results found
    if (filtered.length === 0) {
      const suggestions = getSpellingSuggestions(query);
      setSpellingSuggestions(suggestions);
    } else {
      setSpellingSuggestions([]);
    }

    // Apply price filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        const price = product.price;
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Apply sorting (relevance is already handled by searchProducts)
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        // Keep the relevance order from searchProducts
        break;
    }

    setFilteredProducts(filtered);
  }, [query, products, sortBy, priceRange]); // Removed function dependencies

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiSearch className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Search Results</h1>
              <p className="text-gray-600">
                {query ? `Results for "${query}"` : 'Enter a search term to find products'}
              </p>
            </div>
          </div>

          {/* Search Stats */}
          {query && (
            <div className="text-sm text-gray-600">
              Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {filteredProducts.length > 0 && (
                <span className="ml-2 text-green-600">
                  ✓ Including smart suggestions and spell corrections
                </span>
              )}
            </div>
          )}
          
          {/* Spelling Suggestions */}
          {spellingSuggestions.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiInfo className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Did you mean:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {spellingSuggestions.map((suggestion, index) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    "{suggestion}"
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {query ? (
          <>
            {/* Filters and Sorting */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiFilter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {/* Price Range Filter */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Price:</label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Prices</option>
                      <option value="0-1000">৳0 - ৳1,000</option>
                      <option value="1000-5000">৳1,000 - ৳5,000</option>
                      <option value="5000-10000">৳5,000 - ৳10,000</option>
                      <option value="10000">৳10,000+</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiSearch className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No products found</h2>
                <p className="text-gray-600 mb-4">
                  We couldn't find any products matching "{query}".
                </p>
                
                {/* Search Tips */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                  <h3 className="font-medium text-gray-800 mb-2">Search Tips:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check your spelling</li>
                    <li>• Try different keywords</li>
                    <li>• Use more general terms</li>
                    <li>• Try searching by category or brand</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/products" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse All Products
                  </Link>
                  <Link 
                    to="/" 
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiSearch className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Start your search</h2>
            <p className="text-gray-600 mb-6">Enter keywords in the search bar to find products.</p>
            <Link 
              to="/products" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
