import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useDeleteUser } from '../hooks/useUsers';

const DeleteUserModal = ({ isOpen, onClose, user = null }) => {
  const deleteUser = useDeleteUser();

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

  const fullName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || user.email;

  const handleDelete = () => {
    deleteUser.mutate(user.id || user._id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/40 backdrop-blur-xs font-urbanist animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ED1F23]/10 text-[#ED1F23]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              Delete User Account
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
          Are you sure you want to permanently delete this user account? All access permissions for this account will be revoked immediately.
        </p>

        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-700 space-y-1.5 font-medium break-words">
          <div><span className="text-neutral-400">User Name:</span> <span className="font-bold text-neutral-900">{fullName}</span></div>
          <div><span className="text-neutral-400">Email:</span> {user.email}</div>
          <div><span className="text-neutral-400">Role:</span> <span className="font-semibold">{user.role}</span></div>
          <div><span className="text-neutral-400">Status:</span> {user.status}</div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteUser.isPending}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteUser.isPending}
            className="px-4 py-2.5 rounded-xl bg-[#ED1F23] text-white text-sm font-semibold hover:bg-[#d0191d] transition-all disabled:opacity-50 text-center cursor-pointer shadow-xs"
          >
            {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
