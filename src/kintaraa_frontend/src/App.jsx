import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Support from './pages/Support';
import Report from './pages/Report';
import Community from './pages/Community';
import Resources from './pages/Resources';
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
          <Route path="/" element={
            <>
              <Hero />
              <Features />
              <Support />
            </>
          } />
          <Route path="/report" element={<Report />} />
          <Route path="/support" element={<Support />} />
          <Route path="/support/legal" element={<LegalSupport />} />
          <Route path="/support/medical" element={<MedicalCare />} />
          <Route path="/support/counseling" element={<Counseling />} />
          <Route path="/support/police" element={<PoliceServices />} />
          
          {/* Updated Community routes */}
          <Route path="/community" element={<Community />} />
          <Route path="/community/forum/:id" element={<Community />} />
          <Route path="/community/events" element={<Community />} />
          <Route path="/community/groups" element={<Community />} />
          
          {/* Updated Resources routes */}
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<Resources />} />
          <Route path="/resources/category/:category" element={<Resources />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;