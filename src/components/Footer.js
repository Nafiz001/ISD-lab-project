import React from 'react';
import { Link } from 'react-router-dom';
import { FiSend, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Exclusive */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">Exclusive</h3>
            <p className="text-gray-300 mb-4">Subscribe</p>
            <p className="text-gray-400 text-sm mb-4">Get 10% off your first order</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-transparent border border-gray-600 rounded-l-md text-sm outline-none focus:border-white"
              />
              <button className="px-3 py-2 border border-gray-600 border-l-0 rounded-r-md hover:bg-gray-800 transition-colors">
                <FiSend size={16} />
              </button>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>111 Bijoy sarani, Dhaka,<br />DH 1515, Bangladesh.</p>
              <p>exclusive@gmail.com</p>
              <p>+88015-88888-9999</p>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login / Register</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            </ul>
          </div>

          {/* Quick Link */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Link</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms Of Use</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Download App</h3>
            <p className="text-gray-400 text-xs mb-3">Save ৳3 with App New User Only</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <img src="/qr-code.png" alt="QR Code" className="w-20 h-20 bg-gray-800 rounded" />
              <div className="space-y-2">
                <img src="/google-play.png" alt="Google Play" className="w-full h-10 bg-gray-800 rounded" />
                <img src="/app-store.png" alt="App Store" className="w-full h-10 bg-gray-800 rounded" />
              </div>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; Copyright Logarithm 2025. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
