import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // Nếu chưa đăng nhập, đá về login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Nếu không đủ vai trò cho phép, quay về trang chủ
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PrivateRoute;
