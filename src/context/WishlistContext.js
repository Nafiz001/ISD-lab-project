import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist from localStorage when user changes
  useEffect(() => {
    if (user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.uid}`);
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      } else {
        setWishlistItems([]);
      }
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  // Save wishlist to localStorage
  const saveWishlist = (items) => {
    if (user) {
      localStorage.setItem(`wishlist_${user.uid}`, JSON.stringify(items));
      setWishlistItems(items);
    }
  };

  // Add item to wishlist
  const addToWishlist = (product) => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    const existingItem = wishlistItems.find(item => item.id === product.id);
    if (existingItem) {
      toast.info('Item already in wishlist');
      return;
    }

    const newWishlist = [...wishlistItems, product];
    saveWishlist(newWishlist);
    toast.success('Added to wishlist');
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    if (!user) {
      return;
    }

    const newWishlist = wishlistItems.filter(item => item.id !== productId);
    saveWishlist(newWishlist);
    toast.success('Removed from wishlist');
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Toggle item in wishlist
  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    if (user && window.confirm('Are you sure you want to clear your entire wishlist?')) {
      localStorage.removeItem(`wishlist_${user.uid}`);
      setWishlistItems([]);
      toast.success('Wishlist cleared');
    }
  };

  // Get wishlist item count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
