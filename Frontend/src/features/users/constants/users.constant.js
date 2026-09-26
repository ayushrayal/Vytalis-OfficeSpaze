export const ROLES = [
  { value: 'ADMIN', label: 'Admin', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'GM', label: 'GM', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'TEAM_MANAGER', label: 'Team Manager', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'INTERN', label: 'Intern', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
];

export const USER_STATUS = [
  { value: 'ACTIVE', label: 'Active', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'INACTIVE', label: 'Inactive', badgeClass: 'bg-neutral-100 text-neutral-600 border-neutral-300' }
];

export const MODULE_DEFINITIONS = [
  { key: 'dashboard', label: 'Dashboard', description: 'Overview statistics and recent operations' },
  { key: 'walkins', label: 'Walk-ins', description: 'Visitor logs and front-desk reception records' },
  { key: 'virtual_offices', label: 'Virtual Offices', description: 'Virtual office clients, documentation, and renewals' },
  { key: 'aggregators', label: 'Aggregators', description: 'Third-party channel partners and aggregator accounts' },
  { key: 'managed_offices', label: 'Managed Offices', description: 'Custom managed office spaces and enterprise clients' },
  { key: 'cowork_spaces', label: 'Cowork Space', description: 'Flexible seating, shared workspace desks, and passes' },
  { key: 'dedicated_spaces', label: 'Dedicated Space', description: 'Private cabins and dedicated desks management' },
  { key: 'utility_bills', label: 'Utility Bills', description: 'Electricity, water, internet, and facility invoices' },
  { key: 'salaries', label: 'Salaries', description: 'Team payroll, bonuses, and disbursement records' },
  { key: 'operation_bills', label: 'Operation Bills', description: 'Office operational expenses and maintenance invoices' },
  { key: 'invoice_templates', label: 'Invoice Templates', description: 'Billing formats, templates, and company tax configs' },
  { key: 'escalations', label: 'Escalations', description: 'Operational issues, service tickets, and resolution logs' },
  { key: 'recent_activity', label: 'Recent Activity', description: 'Audit trail of workspace operations and system logs' },
  {
    key: 'meta_leads',
    label: 'Meta Leads',
    description: 'Facebook Lead Ads integration, lead viewing, and synchronization'
  },
  {
    key: 'crm_analytics',
    label: 'CRM Analytics',
    description: 'Lead performance statistics, conversion trends, and follow-up metrics'
  },
  {
    key: 'user_management',
    label: 'User Management',
    description: 'Staff accounts, role assignments, and permissions',
    adminOnly: true
  }
];

/**
 * Modules strictly reserved for the ADMIN role.
 * Cannot be assigned to non-admin staff in the permission matrix.
 */
export const ADMIN_ONLY_MODULES = ['user_management'];

export const ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'update', label: 'Update' },
  { key: 'delete', label: 'Delete' }
];
