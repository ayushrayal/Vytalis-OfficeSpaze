import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';

const salarySchema = z.object({
  employeeName: z.string().trim().min(1, 'Employee name is required'),
  employeeSalary: z.coerce
    .number({ invalid_type_error: 'Employee salary must be a positive number' })
    .gt(0, 'Employee salary must be greater than 0'),
  role: z.string().trim().min(1, 'Role is required'),
  status: z.enum(['Due', 'Paid'], {
    errorMap: () => ({ message: 'Status must be either "Due" or "Paid"' })
  }),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Valid email address is required'),
  phone: z.string().trim().min(1, 'Phone number is required')
});

const SalaryForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const isEditMode = Boolean(initialData && (initialData.id || initialData._id));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      employeeName: '',
      employeeSalary: '',
      role: '',
      status: 'Due',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        employeeName: initialData.employeeName || '',
        employeeSalary: initialData.employeeSalary ?? '',
        role: initialData.role || '',
        status: initialData.status === 'Paid' ? 'Paid' : 'Due',
        email: initialData.email || '',
        phone: initialData.phone || ''
      });
    } else {
      reset({
        employeeName: '',
        employeeSalary: '',
        role: '',
        status: 'Due',
        email: '',
        phone: ''
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Employee Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-black mb-1">
            Employee Name <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            {...register('employeeName')}
            placeholder="e.g. Ananya Roy"
            className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
              errors.employeeName
                ? 'border-red-500 bg-red-50/20'
                : 'border-neutral-200 focus:border-brand-red focus:bg-white'
            }`}
          />
          {errors.employeeName && (
            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.employeeName.message}
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Role <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            {...register('role')}
            placeholder="e.g. Senior Software Engineer"
            className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
              errors.role
                ? 'border-red-500 bg-red-50/20'
                : 'border-neutral-200 focus:border-brand-red focus:bg-white'
            }`}
          />
          {errors.role && (
            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Employee Salary */}
        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Salary Amount (₹) <span className="text-brand-red">*</span>
          </label>
          <input
            type="number"
            step="any"
            {...register('employeeSalary')}
            placeholder="e.g. 65000"
            className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
              errors.employeeSalary
                ? 'border-red-500 bg-red-50/20'
                : 'border-neutral-200 focus:border-brand-red focus:bg-white'
            }`}
          />
          {errors.employeeSalary && (
            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.employeeSalary.message}
            </p>
          )}
        </div>

        {/* Status Select */}
        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Status <span className="text-brand-red">*</span>
          </label>
          <select
            {...register('status')}
            className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-semibold text-black focus:outline-hidden transition-all ${
              errors.status
                ? 'border-red-500 bg-red-50/20'
                : 'border-neutral-200 focus:border-brand-red focus:bg-white'
            }`}
          >
            <option value="Due">Due</option>
            <option value="Paid">Paid</option>
          </select>
          {errors.status && (
            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Phone Number <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            {...register('phone')}
            placeholder="e.g. +91 9876543210"
            className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
              errors.phone
                ? 'border-red-500 bg-red-50/20'
                : 'border-neutral-200 focus:border-brand-red focus:bg-white'
            }`}
          />
          {errors.phone && (
            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-black mb-1">
            Email Address <span className="text-brand-red">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="e.g. ananya@company.com"
            className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
              errors.email
                ? 'border-red-500 bg-red-50/20'
                : 'border-neutral-200 focus:border-brand-red focus:bg-white'
            }`}
          />
          {errors.email && (
            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-50 text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold shadow-xs hover:bg-brand-red/90 focus:outline-hidden transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 text-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEditMode ? 'Save Changes' : 'Add Salary'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default SalaryForm;
