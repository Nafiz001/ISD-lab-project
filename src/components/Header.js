import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBox from './SearchBox';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
        Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!
        <span className="ml-2 font-semibold">ShopNow</span>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Exclusive" 
                className="h-20 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-black transition-colors">
                Home
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-black transition-colors">
                Contact
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-black transition-colors">
                About
              </Link>
              {!user && (
                <Link to="/signup" className="text-gray-600 hover:text-black transition-colors">
                  Sign Up
                </Link>
              )}
            </nav>

            {/* Search Bar */}
            <SearchBox className="hidden md:flex flex-1 max-w-md mx-8" />

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-black transition-colors">
                <FiShoppingCart size={20} />
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-circle">
                    <FiUser size={20} />
                  </label>
                  <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                    <li><Link to="/profile">Manage My Account</Link></li>
                    <li><Link to="/orders">My Orders</Link></li>
                    <li><Link to="/wishlist">My Wishlist</Link></li>
                    {user.isAdmin && (
                      <li><Link to="/admin" className="text-red-600 font-semibold">Admin Panel</Link></li>
                    )}
                    <li><button onClick={handleLogout}>Logout</button></li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="text-gray-600 hover:text-black transition-colors">
                  <FiUser size={20} />
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <SearchBox />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block text-gray-600 hover:text-black transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/contact"
                className="block text-gray-600 hover:text-black transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/about"
                className="block text-gray-600 hover:text-black transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {!user && (
                <Link
                  to="/signup"
                  className="block text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              )}
              
              {user && user.isAdmin && (
                <Link
                  to="/admin"
                  className="block text-red-600 font-semibold hover:text-red-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              
              <div className="flex items-center space-x-4 pt-4 border-t">
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-black transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiShoppingCart size={20} />
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartItemsCount()}
                    </span>
                  )}
                </Link>
                
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-black transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-black transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
