import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/layout/AppShell';
import { ROUTES } from './routeConfig';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import VirtualOfficesPage from '../features/virtual-offices/pages/VirtualOfficesPage';
import ManagedOfficesPage from '../features/managed-offices/pages/ManagedOfficesPage';
import UtilityBillsPage from '../features/utility-bills/pages/UtilityBillsPage';
import SalariesPage from '../features/salaries/pages/SalariesPage';
import OperationBillsPage from '../features/operation-bills/pages/OperationBillsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.VIRTUAL_OFFICES} element={<VirtualOfficesPage />} />
          <Route path={ROUTES.MANAGED_OFFICES} element={<ManagedOfficesPage />} />
          <Route path={ROUTES.UTILITY_BILLS} element={<UtilityBillsPage />} />
          <Route path={ROUTES.SALARIES} element={<SalariesPage />} />
          <Route path={ROUTES.OPERATION_BILLS} element={<OperationBillsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default AppRoutes;
