import React from 'react';
import { ShieldCheck } from 'lucide-react';

const UsersPlaceholderPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage team accounts, assign RBAC roles, and configure granular module permissions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto space-y-4 my-12 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center mx-auto border border-red-100 shadow-xs">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-black">
            User Management Module
          </h2>
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
            Administrator portal registered and route-guarded. Full table, user modals, and permission matrix UI will be activated in Phase 2B.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersPlaceholderPage;
