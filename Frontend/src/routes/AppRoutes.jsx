import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PermissionRoute from './PermissionRoute';
import AppShell from '../components/layout/AppShell';
import { ROUTES } from './routeConfig';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import VirtualOfficesPage from '../features/virtual-offices/pages/VirtualOfficesPage';
import ManagedOfficesPage from '../features/managed-offices/pages/ManagedOfficesPage';
import UtilityBillsPage from '../features/utility-bills/pages/UtilityBillsPage';
import SalariesPage from '../features/salaries/pages/SalariesPage';
import OperationBillsPage from '../features/operation-bills/pages/OperationBillsPage';
import CoworkSpacePage from '../features/cowork-space/pages/CoworkSpacePage';
import DedicatedSpacePage from '../features/dedicated-space/pages/DedicatedSpacePage';
import InvoiceTemplatesPage from '../features/invoice-templates/pages/InvoiceTemplatesPage';
import WalkinsPage from '../features/walkins/pages/WalkinsPage';
import AggregatorsPage from '../features/aggregators/pages/AggregatorsPage';
import EscalationsPage from '../features/escalations/pages/EscalationsPage';
import UsersPage from '../features/users/pages/UsersPage';
import LeadsPage from '../features/leads/pages/LeadsPage';
import FollowUpsPage from '../features/leads/pages/FollowUpsPage';
import LeadAnalyticsPage from '../features/leads/pages/LeadAnalyticsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <PermissionRoute module="dashboard">
                <DashboardPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.VIRTUAL_OFFICES}
            element={
              <PermissionRoute module="virtual_offices">
                <VirtualOfficesPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.MANAGED_OFFICES}
            element={
              <PermissionRoute module="managed_offices">
                <ManagedOfficesPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.UTILITY_BILLS}
            element={
              <PermissionRoute module="utility_bills">
                <UtilityBillsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.SALARIES}
            element={
              <PermissionRoute module="salaries">
                <SalariesPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.OPERATION_BILLS}
            element={
              <PermissionRoute module="operation_bills">
                <OperationBillsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.COWORK_SPACE}
            element={
              <PermissionRoute module="cowork_spaces">
                <CoworkSpacePage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.DEDICATED_SPACE}
            element={
              <PermissionRoute module="dedicated_spaces">
                <DedicatedSpacePage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.INVOICE_TEMPLATES}
            element={
              <PermissionRoute module="invoice_templates">
                <InvoiceTemplatesPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.WALKINS}
            element={
              <PermissionRoute module="walkins">
                <WalkinsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.AGGREGATORS}
            element={
              <PermissionRoute module="aggregators">
                <AggregatorsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.ESCALATIONS}
            element={
              <PermissionRoute module="escalations">
                <EscalationsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.LEADS}
            element={
              <PermissionRoute module="meta_leads" action="view">
                <LeadsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.FOLLOW_UPS}
            element={
              <PermissionRoute module="meta_leads" action="view">
                <FollowUpsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.CRM_ANALYTICS}
            element={
              <PermissionRoute module="meta_leads" action="view">
                <LeadAnalyticsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.USER_MANAGEMENT}
            element={
              <PermissionRoute adminOnly>
                <UsersPage />
              </PermissionRoute>
            }
          />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default AppRoutes;
