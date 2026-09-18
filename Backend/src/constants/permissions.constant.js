/**
 * Centralized RBAC constants for roles, modules, actions, and user status.
 * These are the single source of truth for both schema validation and middleware.
 */

const ROLES = ['ADMIN', 'GM', 'TEAM_MANAGER', 'INTERN'];

const USER_STATUS = ['ACTIVE', 'INACTIVE'];

const MODULES = [
  'dashboard',
  'walkins',
  'virtual_offices',
  'aggregators',
  'managed_offices',
  'cowork_spaces',
  'dedicated_spaces',
  'utility_bills',
  'salaries',
  'operation_bills',
  'invoice_templates',
  'escalations',
  'recent_activity',
  'user_management'
];

const ACTIONS = ['view', 'create', 'update', 'delete'];

/**
 * Modules that are strictly restricted to the ADMIN role.
 * Non-admin roles cannot receive permissions for these modules.
 */
const ADMIN_ONLY_MODULES = ['user_management'];

module.exports = { ROLES, USER_STATUS, MODULES, ACTIONS, ADMIN_ONLY_MODULES };

