import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  Edit2,
  Trash2,
  KeyRound,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { format } from 'date-fns';
import { ROLES, USER_STATUS, ADMIN_ONLY_MODULES } from '../constants/users.constant';

const getInitials = (firstName, lastName, fallbackName) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) return firstName.charAt(0).toUpperCase();
  if (fallbackName) {
    const parts = fallbackName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return fallbackName.slice(0, 2).toUpperCase();
  }
  return 'U';
};

const getRoleBadge = (role) => {
  const match = ROLES.find((r) => r.value === role);
  return {
    label: match ? match.label : role,
    badgeClass: match ? match.badgeClass : 'bg-neutral-100 text-neutral-700 border-neutral-200'
  };
};

const getStatusBadge = (status) => {
  const match = USER_STATUS.find((s) => s.value === status);
  return {
    label: match ? match.label : status,
    badgeClass: match ? match.badgeClass : 'bg-neutral-100 text-neutral-700 border-neutral-200'
  };
};

const calculatePermissionSummary = (user) => {
  if (user.role === 'ADMIN') {
    return { isAdmin: true, text: 'FULL ACCESS' };
  }
  const perms = (Array.isArray(user.permissions) ? user.permissions : []).filter(
    (p) => p && !ADMIN_ONLY_MODULES.includes(p.module)
  );
  const moduleCount = perms.length;
  let actionCount = 0;
  perms.forEach((p) => {
    actionCount += (p.actions || []).length;
  });

  if (moduleCount === 0) {
    return { isAdmin: false, text: '0 modules • 0 actions', empty: true };
  }
  return {
    isAdmin: false,
    text: `${moduleCount} ${moduleCount === 1 ? 'module' : 'modules'} • ${actionCount} ${actionCount === 1 ? 'action' : 'actions'}`,
    empty: false
  };
};

const UsersTable = ({
  users = [],
  currentUserId = null,
  onView,
  onEdit,
  onManagePermissions,
  onResetPassword,
  onToggleStatus,
  onDelete
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };
    const handleScrollOrResize = () => {
      setActiveMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  const handleToggleMenu = (e, item, uid, index) => {
    e.stopPropagation();
    if (activeMenu?.uid === uid) {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuEstimatedHeight = 250;

    // Open upward if space below is insufficient (< 250px), or if item is near bottom of table
    const openUpward =
      spaceBelow < menuEstimatedHeight ||
      (users.length <= 3 && index >= 1) ||
      index >= Math.max(1, users.length - 2);

    setActiveMenu({
      uid,
      item,
      style: {
        position: 'fixed',
        right: `${Math.max(16, window.innerWidth - rect.right)}px`,
        ...(openUpward
          ? { bottom: `${window.innerHeight - rect.top + 6}px` }
          : { top: `${rect.bottom + 6}px` }),
        zIndex: 9999
      }
    });
  };

  return (
    <div className="font-urbanist">
      {/* ─── DESKTOP & TABLET TABLE (hidden on small mobile) ──────────────── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6 whitespace-nowrap">User</th>
                <th className="py-4 px-4 whitespace-nowrap">Email</th>
                <th className="py-4 px-4 whitespace-nowrap">Phone</th>
                <th className="py-4 px-4 whitespace-nowrap">Role</th>
                <th className="py-4 px-4 whitespace-nowrap">Status</th>
                <th className="py-4 px-4 whitespace-nowrap">Permissions</th>
                <th className="py-4 px-4 whitespace-nowrap">Created</th>
                <th className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
              {users.map((item, index) => {
                const uid = item.id || item._id;
                const isSelf = currentUserId && String(currentUserId) === String(uid);
                const fullName = item.firstName && item.lastName
                  ? `${item.firstName} ${item.lastName}`
                  : item.name || 'Unnamed User';
                const initials = getInitials(item.firstName, item.lastName, item.name);
                const roleBadge = getRoleBadge(item.role);
                const statusBadge = getStatusBadge(item.status);
                const permSummary = calculatePermissionSummary(item);
                const createdDate = item.createdAt
                  ? format(new Date(item.createdAt), 'dd MMM yyyy')
                  : '—';

                return (
                  <tr
                    key={uid}
                    onClick={() => onView && onView(item)}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                  >
                    {/* 1. User */}
                    <td className="py-4 px-4 sm:px-6 font-semibold text-neutral-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-bold text-neutral-900">{fullName}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-neutral-100 text-neutral-600 border border-neutral-200">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400 font-normal block sm:hidden">
                            {item.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Email */}
                    <td className="py-4 px-4 text-xs font-medium text-neutral-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{item.email}</span>
                      </div>
                    </td>

                    {/* 3. Phone */}
                    <td className="py-4 px-4 text-xs font-medium text-neutral-700 whitespace-nowrap">
                      {item.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-xs italic">—</span>
                      )}
                    </td>

                    {/* 4. Role */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${roleBadge.badgeClass}`}>
                        {roleBadge.label}
                      </span>
                    </td>

                    {/* 5. Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${statusBadge.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* 6. Permissions */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {permSummary.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-[#ED1F23] border border-red-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>FULL ACCESS</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onManagePermissions) {
                              onManagePermissions(item);
                            } else if (onView) {
                              onView(item);
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            permSummary.empty
                              ? 'bg-neutral-50 text-neutral-400 border-neutral-200 hover:bg-neutral-100'
                              : 'bg-neutral-100/70 text-neutral-800 border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300'
                          }`}
                          title="Click to view or manage permissions"
                        >
                          <Sliders className="w-3 h-3 text-neutral-500" />
                          <span>{permSummary.text}</span>
                        </button>
                      )}
                    </td>

                    {/* 7. Created */}
                    <td className="py-4 px-4 text-xs text-neutral-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{createdDate}</span>
                      </div>
                    </td>

                    {/* 8. Actions Menu */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleToggleMenu(e, item, uid, index)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          activeMenu?.uid === uid
                            ? 'text-neutral-900 bg-neutral-100 ring-2 ring-neutral-200'
                            : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'
                        }`}
                        aria-label="User actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── DESKTOP ACTIONS DROPDOWN PORTAL ─────────────────────────────── */}
      {activeMenu &&
        createPortal(
          <div
            ref={menuRef}
            style={activeMenu.style}
            onClick={(e) => e.stopPropagation()}
            className="w-48 bg-white rounded-xl shadow-2xl border border-neutral-200 p-1 animate-in fade-in zoom-in-95 duration-100 text-left"
          >
            <button
              type="button"
              onClick={() => {
                const item = activeMenu.item;
                setActiveMenu(null);
                onView(item);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-neutral-500" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const item = activeMenu.item;
                setActiveMenu(null);
                onEdit(item);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
              <span>Edit User</span>
            </button>

            {activeMenu.item.role !== 'ADMIN' && (
              <button
                type="button"
                onClick={() => {
                  const item = activeMenu.item;
                  setActiveMenu(null);
                  onManagePermissions(item);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-neutral-500" />
                <span>Manage Permissions</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const item = activeMenu.item;
                setActiveMenu(null);
                onResetPassword(item);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
              <span>Reset Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const item = activeMenu.item;
                setActiveMenu(null);
                onToggleStatus(item);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg cursor-pointer"
            >
              {activeMenu.item.status === 'ACTIVE' ? (
                <>
                  <XCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Deactivate Account</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Activate Account</span>
                </>
              )}
            </button>

            <div className="my-1 border-t border-neutral-100" />

            <button
              type="button"
              onClick={() => {
                const item = activeMenu.item;
                setActiveMenu(null);
                onDelete(item);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#ED1F23] hover:bg-red-50 rounded-lg cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete User</span>
            </button>
          </div>,
          document.body
        )}

      {/* ─── MOBILE CARD VIEW (visible only on small screens < sm) ─────────── */}
      <div className="sm:hidden space-y-3">
        {users.map((item) => {
          const uid = item.id || item._id;
          const isSelf = currentUserId && String(currentUserId) === String(uid);
          const fullName = item.firstName && item.lastName
            ? `${item.firstName} ${item.lastName}`
            : item.name || 'Unnamed User';
          const initials = getInitials(item.firstName, item.lastName, item.name);
          const roleBadge = getRoleBadge(item.role);
          const statusBadge = getStatusBadge(item.status);
          const permSummary = calculatePermissionSummary(item);

          return (
            <div
              key={uid}
              onClick={() => onView && onView(item)}
              className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3 cursor-pointer hover:border-neutral-300 transition-all"
            >
              {/* Header: Avatar, Name, Role, and Action Menu */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-neutral-900 text-sm truncate">{fullName}</h4>
                      {isSelf && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-neutral-100 text-neutral-600 border border-neutral-200">
                          You
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${roleBadge.badgeClass}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                    {statusBadge.label}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(item);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact info */}
              <div className="text-xs text-neutral-600 space-y-1 bg-neutral-50/60 p-2.5 rounded-xl border border-neutral-100">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{item.email}</span>
                </div>
                {item.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{item.phone}</span>
                  </div>
                )}
              </div>

              {/* Permissions & Quick Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100">
                <div>
                  {permSummary.isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-[#ED1F23] border border-red-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>FULL ACCESS</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-neutral-500">
                      {permSummary.text}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 text-xs"
                    title="Edit User"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetPassword(item);
                    }}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 text-xs"
                    title="Reset Password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                    className="p-1.5 rounded-lg border border-red-200 text-[#ED1F23] hover:bg-red-50 text-xs"
                    title="Delete User"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UsersTable;
