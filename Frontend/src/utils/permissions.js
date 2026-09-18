import { ADMIN_ONLY_MODULES } from '../constants/permissions.js';

/**
 * Pure permission-check utility.
 * Works with the user object returned by /api/auth/me.
 *
 * @param {object|null} user   - The authenticated user object
 * @param {string}      module - The module name (e.g. 'walkins')
 * @param {string}      action - The action (e.g. 'view', 'create', 'update', 'delete')
 * @returns {boolean}
 */
export const hasPermission = (user, module, action) => {
  if (!user) return false;

  // ADMIN always has full unrestricted access
  if (user.role === 'ADMIN') return true;

  // Inactive users have no permissions
  if (user.status === 'INACTIVE' || !user.isActive) return false;

  // Admin-only modules can NEVER be accessed by non-admins
  if (ADMIN_ONLY_MODULES.includes(module)) return false;

  // Check permissions array for exact module + action match
  const permissions = user.permissions || [];
  const moduleEntry = permissions.find((p) => p.module === module);
  return Boolean(moduleEntry && moduleEntry.actions && moduleEntry.actions.includes(action));
};

/**
 * Returns true if user can view at least one module.
 * Useful for checking general access after login.
 */
export const hasAnyPermission = (user) => {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.status === 'INACTIVE' || !user.isActive) return false;
  return Array.isArray(user.permissions) && user.permissions.length > 0;
};
