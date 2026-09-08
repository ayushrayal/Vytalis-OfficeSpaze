import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Handshake, AlertCircle, Loader2 } from 'lucide-react';

const aggregatorSchema = z.object({
  name: z.string().trim().min(1, 'Aggregator name is required'),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional().refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: 'Invalid email address format' }
  ),
  notes: z.string().trim().optional()
});

const AggregatorModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const isEditMode = Boolean(initialData && (initialData.id || initialData._id));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(aggregatorSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        notes: initialData.notes || ''
      });
    } else {
      reset({
        name: '',
        phone: '',
        email: '',
        notes: ''
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-white w-full max-w-lg rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-red text-white flex items-center justify-center font-bold text-sm shrink-0">
              <Handshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white my-0 leading-snug">
                {isEditMode ? 'Edit Aggregator' : 'Add Aggregator'}
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium my-0">
                {isEditMode
                  ? 'Update partner aggregator details.'
                  : 'Register a new partner aggregator.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Aggregator Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. ABC Consultants / Workspace Partners"
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.name
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Phone Number (Optional)
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

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="e.g. contact@abc.com"
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

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Notes / Description (Optional)
            </label>
            <textarea
              rows={3}
              {...register('notes')}
              placeholder="Additional notes about partner agreement or contacts..."
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all resize-none ${
                errors.notes
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.notes && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
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
                <span>{isEditMode ? 'Save Changes' : 'Create Aggregator'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AggregatorModal;
