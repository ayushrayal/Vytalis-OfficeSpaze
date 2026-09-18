import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useUpdateUserStatus } from '../hooks/useUsers';

const StatusToggleModal = ({ isOpen, onClose, user = null }) => {
  const updateStatus = useUpdateUserStatus();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const isCurrentlyActive = user.status === 'ACTIVE';
  const targetStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
  const fullName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || user.email;

  const handleConfirm = () => {
    updateStatus.mutate(
      { id: user.id || user._id, status: targetStatus },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/40 backdrop-blur-xs font-urbanist animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isCurrentlyActive ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
              }`}
            >
              {isCurrentlyActive ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              {isCurrentlyActive ? 'Deactivate User Account' : 'Activate User Account'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-600 leading-relaxed">
          {isCurrentlyActive
            ? `Are you sure you want to deactivate ${fullName}? They will be immediately blocked from accessing the system.`
            : `Are you sure you want to reactivate ${fullName}? Their access permissions will be restored immediately.`}
        </p>

        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700 space-y-1">
          <div><span className="text-neutral-400">User:</span> <span className="font-bold text-neutral-900">{fullName}</span></div>
          <div><span className="text-neutral-400">Email:</span> {user.email}</div>
          <div>
            <span className="text-neutral-400">New Status:</span>{' '}
            <span className={`font-bold ${isCurrentlyActive ? 'text-amber-600' : 'text-emerald-600'}`}>
              {targetStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={updateStatus.isPending}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={updateStatus.isPending}
            className={`px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 text-center cursor-pointer shadow-xs ${
              isCurrentlyActive
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {updateStatus.isPending
              ? 'Updating...'
              : isCurrentlyActive
              ? 'Deactivate User'
              : 'Activate User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusToggleModal;
