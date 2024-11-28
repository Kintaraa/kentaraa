import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminUser] = useState(true); // Replace with actual admin check

  return (
    <div className="container mx-auto px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
              K
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              Kintaraa
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/report" className="text-gray-700 hover:text-purple-600 transition">
              Report
            </Link>
            <Link to="/support" className="text-gray-700 hover:text-purple-600 transition">
              Support
            </Link>
            <Link to="/community" className="text-gray-700 hover:text-purple-600 transition">
              Community
            </Link>
            <Link to="/resources" className="text-gray-700 hover:text-purple-600 transition">
              Resources
            </Link>
            {isAdminUser && (
              <Link to="/admin" className="text-gray-700 hover:text-purple-600 transition">
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-6">
          <Link to="/tokens" className="token-glow px-4 py-2 rounded-full bg-white/80 flex items-center">
            <span className="text-purple-600 font-semibold">500 KINT</span>
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition"
            >
              Account
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <Link 
                  to="/get-started" 
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50"
                >
                  Get Started
                </Link>
                <Link 
                  to="/tokens" 
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50"
                >
                  Token Management
                </Link>
                {isAdminUser && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <hr className="my-2" />
                <button 
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;