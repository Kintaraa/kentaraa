import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import TestConnection from './components/TestConnection';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <TestConnection />
      </div>
    </Router>
  );
}

export default App;