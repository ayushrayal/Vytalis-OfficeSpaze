import {
  LayoutDashboard,
  UserCheck,
  Building2,
  Building,
  Receipt,
  Banknote,
  FileText,
  Users,
  Briefcase,
  FileSpreadsheet
} from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';

export const NAVIGATION_SECTIONS = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        path: ROUTES.DASHBOARD,
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Walk-ins',
        path: '/walkins',
        icon: UserCheck
      },
      {
        label: 'Virtual Offices',
        path: '/virtual-offices',
        icon: Building2
      },
      {
        label: 'Managed Offices',
        path: '/managed-offices',
        icon: Building
      }
    ]
  },
  {
    title: 'Finance',
    items: [
      {
        label: 'Utility Bills',
        path: '/utility-bills',
        icon: Receipt
      },
      {
        label: 'Salaries',
        path: '/salaries',
        icon: Banknote
      },
      {
        label: 'Operation Bills',
        path: '/operation-bills',
        icon: FileText
      }
    ]
  },
  {
    title: 'Spaces',
    items: [
      {
        label: 'Cowork Space',
        path: '/cowork-space',
        icon: Users
      },
      {
        label: 'Dedicated Space',
        path: '/dedicated-space',
        icon: Briefcase
      }
    ]
  },
  {
    title: 'Documents',
    items: [
      {
        label: 'Invoice Templates',
        path: '/invoice-templates',
        icon: FileSpreadsheet
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
