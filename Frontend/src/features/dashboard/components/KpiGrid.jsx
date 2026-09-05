import React from 'react';
import {
  UserCheck,
  Building2,
  Building,
  Users,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import KpiCard from './KpiCard';
import { countActiveRecords, calculateTotalSeats } from '../utils/dashboard.utils';

const KpiGrid = ({ data }) => {
  const walkIns = data?.walkIns || [];
  const virtualOffices = data?.virtualOffices || [];
  const managedOffices = data?.managedOffices || [];
  const coworkSpaces = data?.coworkSpaces || [];
  const dedicatedSpaces = data?.dedicatedSpaces || [];
  const dueUtilityBills = data?.dueUtilityBills || [];
  const salaries = data?.salaries || [];
  const operationBills = data?.operationBills || [];
  const invoiceTemplates = data?.invoiceTemplates || [];

  const activeVirtual = countActiveRecords(virtualOffices);
  const activeManaged = countActiveRecords(managedOffices);
  const totalSeatsCount = calculateTotalSeats(managedOffices, coworkSpaces, dedicatedSpaces);

  const dueSalariesCount = salaries.filter((s) => s.status === 'Due').length;
  const dueOpBillsCount = operationBills.filter((o) => o.status === 'Due').length;
  const totalDueRecords = dueUtilityBills.length + dueSalariesCount + dueOpBillsCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <KpiCard
        icon={UserCheck}
        label="Total Walk-ins"
        value={walkIns.length}
        subtext="Total visitor entries logged"
        badgeText="Visitors"
        badgeColor="bg-warm-bg text-black"
      />

      <KpiCard
        icon={Building2}
        label="Virtual Offices"
        value={virtualOffices.length}
        subtext={`${activeVirtual} currently active`}
        badgeText="Registrations"
        badgeColor="bg-blue-50 text-blue-700"
      />

      <KpiCard
        icon={Building}
        label="Managed Offices"
        value={managedOffices.length}
        subtext={`${activeManaged} currently active`}
        badgeText="Managed"
        badgeColor="bg-indigo-50 text-indigo-700"
      />

      <KpiCard
        icon={Users}
        label="Total Allotted Seats"
        value={totalSeatsCount}
        subtext="Managed, Cowork & Dedicated"
        badgeText="Capacity"
        badgeColor="bg-amber-50 text-amber-700"
      />

      <KpiCard
        icon={AlertCircle}
        label="Pending Due Records"
        value={totalDueRecords}
        subtext="Utility, Salary & Ops Due"
        badgeText={totalDueRecords > 0 ? 'Action Due' : 'Up to Date'}
        badgeColor={totalDueRecords > 0 ? 'bg-soft-red text-brand-red' : 'bg-emerald-50 text-emerald-700'}
      />

      <KpiCard
        icon={FileSpreadsheet}
        label="Invoice Templates"
        value={invoiceTemplates.length}
        subtext="Templates configured"
        badgeText="Documents"
        badgeColor="bg-purple-50 text-purple-700"
      />
    </div>
  );
};

export default KpiGrid;
