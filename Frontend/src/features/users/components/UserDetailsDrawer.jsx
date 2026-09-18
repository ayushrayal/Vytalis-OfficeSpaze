import React from 'react';
import {
  User,
  Shield,
  Clock,
  Edit2,
  Trash2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow, DetailBadge } from '../../../components/common/DetailDrawerPrimitives';
import { MODULE_DEFINITIONS, ACTIONS, ADMIN_ONLY_MODULES } from '../constants/users.constant';

const formatTimestamp = (dateVal) => {
  if (!dateVal) return null;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return format(d, 'dd MMM yyyy, HH:mm');
  } catch (e) {
    return null;
  }
};

const UserDetailsDrawer = ({
  isOpen,
  onClose,
  user = null,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete
}) => {
  if (!user) return null;

  const fullName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || user.email;

  const createdDate = formatTimestamp(user.createdAt) || 'Not recorded';
  const updatedDate = formatTimestamp(user.updatedAt);
  const isAdmin = user.role === 'ADMIN';

  // Map permissions to friendly names
  const modMap = new Map(MODULE_DEFINITIONS.map((m) => [m.key, m.label]));
  const actMap = new Map(ACTIONS.map((a) => [a.key, a.label]));

  const assignedPermissions = (Array.isArray(user.permissions) ? user.permissions : []).filter(
    (p) => p && !ADMIN_ONLY_MODULES.includes(p.module)
  );

  const footerActions = (
    <div className="flex flex-wrap items-center justify-between w-full gap-2 sm:gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(user);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:text-[#ED1F23] hover:bg-[#ED1F23]/10 hover:border-[#ED1F23]/20 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onToggleStatus(user);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer"
        >
          {user.status === 'ACTIVE' ? (
            <>
              <XCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Deactivate</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Activate</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            onResetPassword(user);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
          <span>Reset Password</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onEdit(user);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-all shadow-2xs cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit User</span>
        </button>
      </div>
    </div>
  );

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="User Account"
      subtitle={fullName}
      badge={<DetailBadge status={user.status || 'ACTIVE'} variant={user.status === 'ACTIVE' ? 'active' : 'paused'} />}
      icon={User}
      footerActions={footerActions}
    >
      {/* Profile Info */}
      <DetailSection title="Account Information" icon={User}>
        <DetailRow label="First Name" value={user.firstName || '—'} />
        <DetailRow label="Last Name" value={user.lastName || '—'} />
        <DetailRow label="Email Address" value={user.email} isEmail fullWidth />
        <DetailRow label="Phone Number" value={user.phone || '—'} isPhone />
        <DetailRow label="System Role" value={user.role} />
      </DetailSection>

      {/* Permissions Section */}
      <DetailSection title="Module Permissions" icon={Shield} gridClassName="space-y-3">
        {isAdmin ? (
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/80 space-y-1.5 font-urbanist">
            <div className="flex items-center gap-2 text-brand-red font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#ED1F23]" />
              <span>FULL ACCESS</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              This user is an Administrator with unrestricted access to every feature, module, route, and data record in Vytalis OfficeSpaze.
            </p>
          </div>
        ) : assignedPermissions.length === 0 ? (
          <div className="p-6 rounded-xl bg-neutral-50 border border-dashed border-neutral-200 text-center space-y-1">
            <p className="text-xs font-bold text-neutral-800">No Custom Permissions Assigned</p>
            <p className="text-[11px] text-neutral-500">
              This staff member has no explicit module permissions. Edit this user to grant access.
            </p>
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100 bg-white">
            {assignedPermissions.map((perm) => {
              const moduleLabel = modMap.get(perm.module) || perm.module;
              const actions = perm.actions || [];

              return (
                <div key={perm.module} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">{moduleLabel}</span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      {perm.module}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {actions.map((act) => (
                      <span
                        key={act}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200"
                      >
                        {actMap.get(act) || act}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DetailSection>

      {/* System Information */}
      <DetailSection title="System Information" icon={Clock}>
        <DetailRow label="User ID" value={user.id || user._id} isCode />
        <DetailRow label="Account Status" value={user.status} />
        <DetailRow label="Created Date" value={createdDate} />
        {updatedDate && <DetailRow label="Last Modified" value={updatedDate} />}
      </DetailSection>
    </DetailsDrawer>
  );
};

export default UserDetailsDrawer;
