import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Support from './pages/Support';
import Report from './pages/Report';
import Community from './pages/Community';
import Resources from './pages/Resources';
import GetStarted from './pages/GetStarted';
import AdminDashboard from './pages/admin/Dashboard';
import TokenManagement from './components/TokenManagement';
import Login from './pages/Login';
import LegalSupport from './pages/services/LegalSupport';
import MedicalCare from './pages/services/MedicalCare';
import Counseling from './pages/services/Counseling';
import PoliceServices from './pages/services/PoliceServices';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <>
                <Hero />
                <Features />
                <Support />
              </>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/report" element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            } />
            
            <Route path="/support" element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } />

            {/* Service Routes */}
            <Route path="/support/legal" element={
              <ProtectedRoute>
                <LegalSupport />
              </ProtectedRoute>
            } />
            <Route path="/support/medical" element={
              <ProtectedRoute>
                <MedicalCare />
              </ProtectedRoute>
            } />
            <Route path="/support/counseling" element={
              <ProtectedRoute>
                <Counseling />
              </ProtectedRoute>
            } />
            <Route path="/support/police" element={
              <ProtectedRoute>
                <PoliceServices />
              </ProtectedRoute>
            } />

            {/* Community Routes */}
            <Route path="/community/*" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />

            {/* Resources Routes */}
            <Route path="/resources/*" element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            } />

            {/* User Management Routes */}
            <Route path="/get-started" element={
              <ProtectedRoute>
                <GetStarted />
              </ProtectedRoute>
            } />
            
            <Route path="/tokens" element={
              <ProtectedRoute>
                <TokenManagement />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;