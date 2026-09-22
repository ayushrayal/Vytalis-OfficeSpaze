/**
 * Frontend RBAC constants — mirrors Backend/src/constants/permissions.constant.js
 */

export const ROLES = ['ADMIN', 'GM', 'TEAM_MANAGER', 'INTERN'];

export const USER_STATUS = ['ACTIVE', 'INACTIVE'];

export const MODULES = [
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
  'user_management',
  'meta_leads'
];

export const ACTIONS = ['view', 'create', 'update', 'delete'];

/**
 * Modules strictly reserved for the ADMIN role.
 * Non-admins cannot receive or execute permissions for these modules.
 */
export const ADMIN_ONLY_MODULES = ['user_management'];

export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  GM: 'General Manager',
  TEAM_MANAGER: 'Team Manager',
  INTERN: 'Intern'
};

export const MODULE_LABELS = {
  dashboard: 'Dashboard',
  walkins: 'Walk-ins',
  virtual_offices: 'Virtual Offices',
  aggregators: 'Aggregators',
  managed_offices: 'Managed Offices',
  cowork_spaces: 'Cowork Spaces',
  dedicated_spaces: 'Dedicated Spaces',
  utility_bills: 'Utility Bills',
  salaries: 'Salaries',
  operation_bills: 'Operation Bills',
  invoice_templates: 'Invoice Templates',
  escalations: 'Escalations',
  recent_activity: 'Recent Activity',
  user_management: 'User Management',
  meta_leads: 'Meta Leads'
};
