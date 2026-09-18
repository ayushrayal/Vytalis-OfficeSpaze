import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import usePermissions from '../hooks/usePermissions';
import AccessRestricted from '../components/common/AccessRestricted';
import { ROUTES } from './routeConfig';

/**
 * Reusable route guard for module permissions and admin-only access.
 *
 * Props:
 * - module: string - The RBAC module name (e.g. 'walkins', 'virtual_offices')
 * - action: string - Action required (defaults to 'view')
 * - adminOnly: boolean - If true, restricts route exclusively to ADMIN role
 * - children: ReactNode - Optional child component; falls back to <Outlet /> for nested routes
 */
const PermissionRoute = ({ module, action = 'view', adminOnly = false, children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { can, isAdmin } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Checking Permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Admin-only route guard (e.g. /users)
  if (adminOnly) {
    if (!isAdmin) {
      return <AccessRestricted />;
    }
    return children ? children : <Outlet />;
  }

  // ADMIN bypasses all module permission checks
  if (isAdmin) {
    return children ? children : <Outlet />;
  }

  // Check explicit permission for non-admin users
  if (!module || !can(module, action)) {
    return <AccessRestricted />;
  }

  return children ? children : <Outlet />;
};

export default PermissionRoute;
