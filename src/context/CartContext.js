import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const CartContext = createContext();

// Storage utilities
const CART_STORAGE_KEY = 'ecommerce_cart_items';

const saveToStorage = (items) => {
  try {
    const cartData = {
      items: items,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    // Try localStorage first
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    
    // Also save to sessionStorage as backup
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    
    return true;
  } catch (error) {
    console.error('Error saving cart:', error);
    return false;
  }
};

const loadFromStorage = () => {
  try {
    // Try localStorage first
    let savedData = localStorage.getItem(CART_STORAGE_KEY);
    
    // If localStorage fails, try sessionStorage
    if (!savedData) {
      savedData = sessionStorage.getItem(CART_STORAGE_KEY);
    }
    
    if (savedData) {
      const cartData = JSON.parse(savedData);
      
      if (cartData.items && Array.isArray(cartData.items)) {
        return cartData.items;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      };

    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      let newItems;
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      
      return { ...state, items: newItems };

    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return { ...state, items: filteredItems };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { ...state, items: updatedItems };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const isInitialized = useRef(false);

  // Load cart from storage on mount
  useEffect(() => {
    const savedItems = loadFromStorage();
    
    if (savedItems.length > 0) {
      dispatch({ type: 'LOAD_CART', payload: savedItems });
    }
    
    isInitialized.current = true;
  }, []);

  // Save cart to storage whenever items change (but not on initial load)
  useEffect(() => {
    if (isInitialized.current) {
      saveToStorage(state.items);
    }
  }, [state.items]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    const total = state.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    return total;
  };

  const getCartItemsCount = () => {
    const count = state.items.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      return sum + quantity;
    }, 0);
    return count;
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
