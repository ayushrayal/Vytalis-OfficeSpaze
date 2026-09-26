import {
  LayoutDashboard,
  UserCheck,
  Building2,
  Building,
  Handshake,
  Receipt,
  Banknote,
  FileText,
  Users,
  Briefcase,
  FileSpreadsheet,
  AlertOctagon,
  ShieldCheck,
  Megaphone,
  CalendarCheck,
  BarChart3
} from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';

export const NAVIGATION_SECTIONS = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        path: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        module: 'dashboard'
      }
    ]
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Walk-ins',
        path: ROUTES.WALKINS,
        icon: UserCheck,
        module: 'walkins'
      },
      {
        label: 'Virtual Offices',
        path: ROUTES.VIRTUAL_OFFICES,
        icon: Building2,
        module: 'virtual_offices'
      },
      {
        label: 'Managed Offices',
        path: ROUTES.MANAGED_OFFICES,
        icon: Building,
        module: 'managed_offices'
      },
      {
        label: 'Aggregators',
        path: ROUTES.AGGREGATORS,
        icon: Handshake,
        module: 'aggregators'
      },
      {
        label: 'Escalations',
        path: ROUTES.ESCALATIONS,
        icon: AlertOctagon,
        module: 'escalations'
      },
      {
        label: 'Meta Leads',
        path: ROUTES.LEADS,
        icon: Megaphone,
        module: 'meta_leads'
      },
      {
        label: 'Follow-ups',
        path: ROUTES.FOLLOW_UPS,
        icon: CalendarCheck,
        module: 'meta_leads'
      },
      {
        label: 'CRM Analytics',
        path: ROUTES.CRM_ANALYTICS,
        icon: BarChart3,
        module: 'crm_analytics'
      }
    ]
  },
  {
    title: 'Finance',
    items: [
      {
        label: 'Utility Bills',
        path: ROUTES.UTILITY_BILLS,
        icon: Receipt,
        module: 'utility_bills'
      },
      {
        label: 'Salaries',
        path: ROUTES.SALARIES,
        icon: Banknote,
        module: 'salaries'
      },
      {
        label: 'Operation Bills',
        path: ROUTES.OPERATION_BILLS,
        icon: FileText,
        module: 'operation_bills'
      }
    ]
  },
  {
    title: 'Spaces',
    items: [
      {
        label: 'Cowork Space',
        path: ROUTES.COWORK_SPACE,
        icon: Users,
        module: 'cowork_spaces'
      },
      {
        label: 'Dedicated Space',
        path: ROUTES.DEDICATED_SPACE,
        icon: Briefcase,
        module: 'dedicated_spaces'
      }
    ]
  },
  {
    title: 'Documents',
    items: [
      {
        label: 'Invoice Templates',
        path: ROUTES.INVOICE_TEMPLATES,
        icon: FileSpreadsheet,
        module: 'invoice_templates'
      }
    ]
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'User Management',
        path: ROUTES.USER_MANAGEMENT,
        icon: ShieldCheck,
        module: 'user_management',
        adminOnly: true
      }
    ]
  }
];

export const getPageTitleByPath = (pathname) => {
  for (const section of NAVIGATION_SECTIONS) {
    for (const item of section.items) {
      if (item.path === pathname) {
        return item.label;
      }
    }
  }
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  return 'Dashboard';
};
