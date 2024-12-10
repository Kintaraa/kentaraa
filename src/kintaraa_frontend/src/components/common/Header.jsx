import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { AuthService } from '../../services/authService';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isPlugConnected, setIsPlugConnected] = useState(false);
  const [balance, setBalance] = useState(null); // Add state for balance
  const [userDetails, setUserDetails] = useState(null);

  const navigation = [
    { name: 'Report', href: '/report' },
    { name: 'Support', href: '/support' },
    { name: 'Community', href: '/community' },
    { name: 'Resources', href: '/resources' },
  ];

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const userData = AuthService.getUser();
        setUserDetails(userData);
      } catch (error) {
        console.error('Error loading user details:', error);
      }
    };
    
    if (user) {
      loadUserDetails();
    }
  }, [user]);

  // Function to load token data after Plug wallet connects
  const loadTokenData = async (principal) => {
    try {
      const [balanceData, txHistory] = await Promise.all([
        api.getTokenBalance(principal),
        api.getTransactionHistory(principal)
      ]);
      setBalance(balanceData.Ok); // Store balance
    } catch (error) {
      console.error('Error loading token data:', error);
    }
  };

  // Handle Plug connection
  const handleConnectPlug = async () => {
    if (window.ic && window.ic.plug) {
      try {
        const isConnected = await window.ic.plug.requestConnect();
        if (isConnected) {
          console.log('Plug connected!');
          setIsPlugConnected(true);

          // Fetch principal and load token data
          const principal = await AuthService.getPrincipal();
          loadTokenData(principal);
        }
      } catch (error) {
        console.error('Failed to connect to Plug:', error);
      }
    } else {
      console.log('Plug wallet is not installed. Please install it to connect.');
      alert('Plug wallet is not installed. Please install the Plug wallet extension.');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <header className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <img
                  src="/Kintara-Logo.png"
                  alt="Kintara Logo"
                  className="w-10 h-10 object-contain"
                />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
                  Kintaraa
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                {isPlugConnected && balance ? (
                  <div className="token-glow px-4 py-2 rounded-full bg-white/80 flex items-center">
                    <span className="text-purple-600 font-semibold">{balance.balance} KINT</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-full bg-white/80 text-gray-400">
                    <span>Connect Wallet</span>
                  </div>
                )}
                <Link
                  to={`/dashboard/${userDetails?.userType || user.userType}`}
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectPlug}
                className={`px-4 py-2 rounded-full ${
                  isPlugConnected
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } transition transform hover:scale-105`}
              >
                {isPlugConnected ? 'Connected to Plug' : 'Connect to Plug'}
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {userDetails ? (
            <>
              <Link
                to={`/dashboard/${userDetails?.userType || user.userType}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleConnectPlug}
              className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              Connect to Plug
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
