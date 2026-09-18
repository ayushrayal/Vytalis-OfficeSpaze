import { useCallback } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { hasPermission } from '../utils/permissions';

/**
 * React hook that exposes permission-check helpers for the authenticated user.
 *
 * Usage:
 *   const { can, isAdmin, role, permissions } = usePermissions();
 *   if (can('walkins', 'create')) { ... }
 *   if (isAdmin) { ... }
 */
const usePermissions = () => {
  const { user } = useAuth();

  const can = useCallback(
    (module, action) => hasPermission(user, module, action),
    [user]
  );

  return {
    can,
    isAdmin: user?.role === 'ADMIN',
    role: user?.role || null,
    status: user?.status || null,
    permissions: user?.permissions || []
  };
};

export default usePermissions;
