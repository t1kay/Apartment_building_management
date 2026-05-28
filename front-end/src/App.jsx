import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Household from './pages/Household';
import Fee from './pages/Fee';
import Profile from './pages/Profile';
import Resident from './pages/Resident';
import Vehicle from './pages/Vehicle';
import Account from './pages/Account';
import FeeType from './pages/FeeType';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            {/* Route công khai */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Các route yêu cầu đăng nhập */}
            <Route 
              path="/home" 
              element={<PrivateRoute><Home /></PrivateRoute>} 
            />
            <Route 
              path="/household" 
              element={<PrivateRoute><Household /></PrivateRoute>} 
            />
            <Route 
              path="/fee" 
              element={<PrivateRoute><Fee /></PrivateRoute>} 
            />
            <Route 
              path="/profile" 
              element={<PrivateRoute><Profile /></PrivateRoute>} 
            />
            <Route 
              path="/resident" 
              element={<PrivateRoute><Resident /></PrivateRoute>} 
            />
            <Route 
              path="/vehicle" 
              element={<PrivateRoute><Vehicle /></PrivateRoute>} 
            />

            {/* Các route yêu cầu quyền Tổ trưởng */}
            <Route 
              path="/account" 
              element={
                <PrivateRoute allowedRoles={['Tổ trưởng']}>
                  <Account />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/fee-type" 
              element={
                <PrivateRoute allowedRoles={['Tổ trưởng']}>
                  <FeeType />
                </PrivateRoute>
              } 
            />

            {/* Các route không khớp, điều hướng về login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
