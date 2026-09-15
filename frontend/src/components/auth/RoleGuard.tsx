import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role ? user.role.toUpperCase().replace(' ', '_') : '';
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase().replace(' ', '_'));

  // ADMIN always has full access
  const hasAccess = userRole === 'ADMIN' || normalizedAllowed.includes(userRole);

  if (!hasAccess) {
    return <Navigate to="/access-denied" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
