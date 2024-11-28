import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceApi } from '../../services/serviceApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    legal: null,
    medical: null,
    counseling: null,
    police: null
  });

  const [providers, setProviders] = useState([]);

  useEffect(() => {
    loadStats();
    loadProviders();
  }, []);

  const loadStats = async () => {
    try {
      const [legal, medical, counseling, police] = await Promise.all([
        serviceApi.getServiceStats(serviceApi.ServiceType.Legal),
        serviceApi.getServiceStats(serviceApi.ServiceType.Medical),
        serviceApi.getServiceStats(serviceApi.ServiceType.Counseling),
        serviceApi.getServiceStats(serviceApi.ServiceType.Police)
      ]);
      setStats({ legal, medical, counseling, police });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadProviders = async () => {
    try {
      const allProviders = await serviceApi.getAllProviders();
      setProviders(allProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link 
            to="/admin/providers/new"
            className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700"
          >
            Add Provider
          </Link>
        </div>

        {/* Service Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {Object.entries(stats).map(([service, stat]) => (
            stat && (
              <div key={service} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 capitalize">{service}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Requests:</span>
                    <span className="font-semibold">{stat.total_requests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active:</span>
                    <span className="font-semibold">{stat.active_requests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Providers:</span>
                    <span className="font-semibold">{stat.available_providers}</span>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Service Providers List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Service Providers</h2>
          </div>
          <div className="divide-y">
            {providers.map((provider) => (
              <div key={provider.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <p className="text-gray-600 capitalize">{provider.service_type}</p>
                  </div>
                  <div className="flex space-x-4 items-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      provider.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {provider.availability ? 'Available' : 'Unavailable'}
                    </span>
                    <Link 
                      to={`/admin/providers/${provider.id}`}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
                <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                  <span>Current Load: {provider.current_load}</span>
                  <span>Total Cases: {provider.total_cases}</span>
                  <span>Rating: {provider.rating.toFixed(1)}/5.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;