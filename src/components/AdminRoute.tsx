import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'ADMIN';
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (children) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  
  return <Outlet />;
};

export default AdminRoute;