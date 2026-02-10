import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DailyCalculator from './components/DailyCalculator';
import SavedBills from './pages/SavedBills';
import Clients from './pages/Clients';
function App() {
  return (
    <Router>
      <div className="page-wrapper">
        <Routes>
            // inside your Routes definition
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<DailyCalculator />} />
          <Route path="/bills" element={<SavedBills />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Navbar />
      </div>
    </Router>
  );
}

export default App;