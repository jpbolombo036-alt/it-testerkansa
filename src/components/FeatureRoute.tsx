import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isFeatureEnabled } from '../utils/featureFlags';

interface FeatureRouteProps {
  feature: 'presencesEnabled' | 'documentArchiveEnabled';
  children?: React.ReactNode;
}

const FeatureRoute: React.FC<FeatureRouteProps> = ({ feature, children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isFeatureEnabled(feature)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <React.Fragment>{children}</React.Fragment> : <Outlet />;
};

export default FeatureRoute;