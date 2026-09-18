import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, Eye, EyeOff, Shield, Lock, Mail, Phone, User } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { ADMIN_ONLY_MODULES } from '../constants/users.constant';
import PermissionMatrixEditor from './PermissionMatrixEditor';
import FilterSelect from '../../../components/ui/FilterSelect';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin (Full Access)' },
  { value: 'GM', label: 'GM' },
  { value: 'TEAM_MANAGER', label: 'Team Manager' },
  { value: 'INTERN', label: 'Intern' }
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' }
];

const UserModal = ({ isOpen, onClose, user = null }) => {
  const isEdit = Boolean(user);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('GM');
  const [status, setStatus] = useState('ACTIVE');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Edit mode - initialize with user data
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setRole(user.role || 'GM');
        setStatus(user.status || 'ACTIVE');
        setPassword('');
        // Non-admin permissions start from backend data (strictly stripping any admin-only modules)
        setPermissions(
          Array.isArray(user.permissions)
            ? user.permissions.filter((p) => p && !ADMIN_ONLY_MODULES.includes(p.module))
            : []
        );
      } else {
        // Create mode
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setRole('GM');
        setStatus('ACTIVE');
        setPassword('');
        setPermissions([]);
      }
      setShowPassword(false);
      setErrors({});
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!isEdit) {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (password && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      status,
      // For Admin, backend clears permissions; for non-admin, ensure admin-only modules are stripped
      permissions:
        role === 'ADMIN'
          ? []
          : permissions.filter((p) => p && !ADMIN_ONLY_MODULES.includes(p.module))
    };

    if (!isEdit) {
      payload.password = password;
      createUser.mutate(payload, {
        onSuccess: () => onClose()
      });
    } else {
      if (password) {
        payload.password = password;
      }
      updateUser.mutate(
        { id: user.id || user._id, data: payload },
        {
          onSuccess: () => onClose()
        }
      );
    }
  };

  const isSubmitting = createUser.isPending || updateUser.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/40 backdrop-blur-xs font-urbanist animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ED1F23]/10 text-[#ED1F23]">
              {isEdit ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                {isEdit ? 'Edit Team Member' : 'Add New User'}
              </h3>
              <p className="text-xs text-neutral-500">
                {isEdit
                  ? 'Update user details, system role, and access rights'
                  : 'Create a new staff account and assign roles & permissions'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                First Name <span className="text-[#ED1F23]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) setErrors({ ...errors, firstName: null });
                  }}
                  placeholder="e.g. Rahul"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50/60 border rounded-xl text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all ${
                    errors.firstName ? 'border-red-400 bg-red-50/30' : 'border-neutral-200'
                  }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] font-semibold text-[#ED1F23] mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Last Name <span className="text-[#ED1F23]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) setErrors({ ...errors, lastName: null });
                  }}
                  placeholder="e.g. Sharma"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50/60 border rounded-xl text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all ${
                    errors.lastName ? 'border-red-400 bg-red-50/30' : 'border-neutral-200'
                  }`}
                />
              </div>
              {errors.lastName && (
                <p className="text-[11px] font-semibold text-[#ED1F23] mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-[#ED1F23]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  placeholder="user@vytalis.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50/60 border rounded-xl text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all ${
                    errors.email ? 'border-red-400 bg-red-50/30' : 'border-neutral-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-semibold text-[#ED1F23] mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Role <span className="text-[#ED1F23]">*</span>
              </label>
              <FilterSelect
                value={role}
                onChange={(val) => setRole(val)}
                options={ROLE_OPTIONS}
                icon={Shield}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Status <span className="text-[#ED1F23]">*</span>
              </label>
              <FilterSelect
                value={status}
                onChange={(val) => setStatus(val)}
                options={STATUS_OPTIONS}
                className="w-full"
              />
            </div>
          </div>

          {/* Password (Required for create, optional/blank for edit) */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              {isEdit ? 'Update Password (optional)' : 'Password'}{' '}
              {!isEdit && <span className="text-[#ED1F23]">*</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder={isEdit ? 'Leave blank to keep existing password' : 'At least 6 characters'}
                className={`w-full pl-10 pr-10 py-2.5 bg-neutral-50/60 border rounded-xl text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all ${
                  errors.password ? 'border-red-400 bg-red-50/30' : 'border-neutral-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] font-semibold text-[#ED1F23] mt-1">{errors.password}</p>
            )}
          </div>

          {/* Permissions Section */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Module Permissions
              </label>
              {role !== 'ADMIN' && (
                <span className="text-[11px] text-neutral-400">
                  Explicitly grant access per module & action
                </span>
              )}
            </div>

            <PermissionMatrixEditor
              permissions={permissions}
              onChange={setPermissions}
              role={role}
              disabled={isSubmitting}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#ED1F23] text-white text-sm font-semibold hover:bg-[#d0191d] transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isEdit ? 'Saving...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create User'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
