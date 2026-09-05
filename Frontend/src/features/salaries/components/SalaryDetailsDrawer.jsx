import React from 'react';
import { Banknote, Edit2, Trash2, User, DollarSign, Briefcase, Mail, Phone, Clock } from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow, DetailBadge } from '../../../components/common/DetailDrawerPrimitives';
import { format } from 'date-fns';

const SalaryDetailsDrawer = ({ isOpen, onClose, salary, onEdit, onDelete }) => {
  if (!salary) return null;

  const createdDate = salary.createdAt
    ? format(new Date(salary.createdAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';
  const updatedDate = salary.updatedAt
    ? format(new Date(salary.updatedAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';

  const footerActions = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={() => {
          onClose();
          onDelete(salary);
        }}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:text-[#ED1F23] hover:bg-[#ED1F23]/10 hover:border-[#ED1F23]/20 transition-all"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onClose();
          onEdit(salary);
        }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs"
      >
        <Edit2 className="w-4 h-4" />
        <span>Edit Salary</span>
      </button>
    </div>
  );

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Salary Record"
      subtitle={salary.employeeName}
      badge={<DetailBadge status={salary.status} variant={salary.status?.toLowerCase()} />}
      icon={Banknote}
      footerActions={footerActions}
    >
      {/* Employee Overview */}
      <DetailSection title="Employee Information" icon={User}>
        <DetailRow label="Employee Name" value={salary.employeeName} fullWidth />
        <DetailRow label="Role / Designation" value={salary.employeeRole} />
        <DetailRow label="Disbursement Status" value={salary.status} badgeVariant={salary.status?.toLowerCase()} />
      </DetailSection>

      {/* Salary & Contact */}
      <DetailSection title="Compensation & Contact" icon={DollarSign}>
        <DetailRow label="Employee Salary" value={salary.employeeSalary} isCurrency fullWidth />
        <DetailRow label="Phone Number" value={salary.employeePhone} isPhone />
        <DetailRow label="Email Address" value={salary.employeeEmail} isEmail />
      </DetailSection>

      {/* System Information */}
      <DetailSection title="System Information" icon={Clock}>
        <DetailRow label="Created At" value={createdDate} />
        <DetailRow label="Last Updated" value={updatedDate} />
      </DetailSection>
    </DetailsDrawer>
  );
};

export default SalaryDetailsDrawer;
