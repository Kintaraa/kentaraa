import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import LegalSupport from './pages/services/LegalSupport';
import MedicalCare from './pages/services/MedicalCare';
import Counseling from './pages/services/Counseling';
import PoliceServices from './pages/services/PoliceServices';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Home Route */}
          <Route path="/" element={
            <>
              <Hero />
              <Features />
              <Support />
            </>
          } />

          {/* Main Navigation Routes */}
          <Route path="/report" element={<Report />} />
          <Route path="/support" element={<Support />} />
          <Route path="/community" element={<Community />} />
          <Route path="/resources" element={<Resources />} />
          
          {/* Service Routes */}
          <Route path="/support/legal" element={<LegalSupport />} />
          <Route path="/support/medical" element={<MedicalCare />} />
          <Route path="/support/counseling" element={<Counseling />} />
          <Route path="/support/police" element={<PoliceServices />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/providers/:id" element={<AdminDashboard />} />
          <Route path="/admin/providers/new" element={<AdminDashboard />} />

          {/* User Management Routes */}
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/tokens" element={<TokenManagement />} />
          
          {/* Community Sub-routes */}
          <Route path="/community/forum/:id" element={<Community />} />
          <Route path="/community/events" element={<Community />} />
          <Route path="/community/groups" element={<Community />} />
          
          {/* Resource Sub-routes */}
          <Route path="/resources/:id" element={<Resources />} />
          <Route path="/resources/category/:category" element={<Resources />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;