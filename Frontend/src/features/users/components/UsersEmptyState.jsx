import React from 'react';
import { Users, UserX, SearchX, Plus, RefreshCw } from 'lucide-react';

const UsersEmptyState = ({ hasFilters, onClearFilters, onAddUser }) => {
  if (hasFilters) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-12 text-center max-w-md mx-auto my-8 shadow-xs font-urbanist space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
          <SearchX className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-900">No Matching Users</h3>
          <p className="text-xs text-neutral-500 mt-1">
            We couldn't find any team members matching your search or active filter criteria.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-12 text-center max-w-md mx-auto my-8 shadow-xs font-urbanist space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#ED1F23]/10 text-[#ED1F23] flex items-center justify-center mx-auto">
        <Users className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-neutral-900">No Users Found</h3>
        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
          There are no team members in the system yet. Add your first user to start collaborating with roles and granular permissions.
        </p>
      </div>
      {onAddUser && (
        <button
          type="button"
          onClick={onAddUser}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ED1F23] hover:bg-[#d0191d] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add First User</span>
        </button>
      )}
    </div>
  );
};

export default UsersEmptyState;
