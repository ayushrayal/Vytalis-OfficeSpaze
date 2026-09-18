const { ADMIN_ONLY_MODULES } = require('../constants/permissions.constant');

/**
 * Permission middleware for RBAC enforcement.
 *
 * requireAdmin  — allows only ADMIN role through, 403 for everyone else.
 * requirePermission(module, action) — allows ADMIN through unconditionally;
 *   for other roles, checks req.user.permissions for the given module+action.
 */

/**
 * Allows only users with role === 'ADMIN'.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: ['UNAUTHENTICATED']
    });
  }

  if (req.user.status === 'INACTIVE' || !req.user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is inactive. Please contact your administrator.',
      errors: ['ACCOUNT_INACTIVE']
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'This action requires Administrator privileges.',
      errors: ['FORBIDDEN']
    });
  }

  next();
};

/**
 * Checks that the authenticated user has permission for `module` + `action`.
 * ADMIN bypasses all permission checks.
 * Non-admin users must have an explicit entry in their permissions array.
 *
 * @param {string} module  - One of the MODULES constants
 * @param {string} action  - One of 'view' | 'create' | 'update' | 'delete'
 */
const requirePermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: ['UNAUTHENTICATED']
      });
    }

    // ADMIN bypasses all permission checks
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Admin-only modules can NEVER be accessed by non-admins
    if (ADMIN_ONLY_MODULES.includes(module)) {
      return res.status(403).json({
        success: false,
        message: 'This action requires Administrator privileges.',
        errors: ['FORBIDDEN']
      });
    }

    // Active status re-check for belt-and-suspenders safety
    if (req.user.status === 'INACTIVE' || !req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact your administrator.',
        errors: ['ACCOUNT_INACTIVE']
      });
    }

    // Check permissions array for the required module + action
    const permissions = req.user.permissions || [];
    const modulePermission = permissions.find((p) => p.module === module);
    if (!modulePermission || !modulePermission.actions.includes(action)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
        errors: ['FORBIDDEN']
      });
    }

    next();
  };
};

module.exports = { requireAdmin, requirePermission };
