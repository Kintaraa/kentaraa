import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/'; 

  const handleLogin = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        onSuccess: () => {
          const identity = authClient.getIdentity();
          window.localStorage.setItem('identity', JSON.stringify(identity));
          navigate(from, { replace: true });
        },
        onError: (error) => {
          console.error('Login failed:', error);
        },
      });
    } catch (error) {
      console.error('Failed to initialize AuthClient:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            K
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Kintaraa</h2>
          <p className="text-gray-600">
            Login securely with Internet Identity
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-full hover:bg-purple-700 transition flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Login with Internet Identity</span>
        </button>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">
            Your security is our priority. All data is encrypted and protected.
          </p>
          <p>
            Need help? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
