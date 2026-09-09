import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertOctagon, AlertCircle, Loader2, Clock, User, FileText, Tag } from 'lucide-react';

const SUGGESTED_TYPES = [
  'Electricity',
  'Internet',
  'Parking',
  'Unannounced Client',
  'Cleaning',
  'Maintenance',
  'Security',
  'HVAC / AC'
];

const RESOLVE_TIME_PRESETS = [1, 2, 4, 6, 12, 24, 48];

const escalationSchema = z.object({
  escalationType: z.string().trim().min(1, 'Escalation type is required'),
  description: z.string().trim().min(1, 'Description is required'),
  escalatedBy: z.string().trim().min(1, 'Escalated by name is required'),
  priority: z.enum(['High', 'Medium', 'Low'], {
    errorMap: () => ({ message: 'Priority must be High, Medium, or Low' })
  }),
  resolveTime: z.coerce
    .number({ invalid_type_error: 'Resolve time must be a number' })
    .positive('Resolve time must be greater than 0 hours')
});

const EscalationModal = ({
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
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(escalationSchema),
    defaultValues: {
      escalationType: '',
      description: '',
      escalatedBy: '',
      priority: 'Medium',
      resolveTime: 24
    }
  });

  const selectedPriority = watch('priority');
  const currentResolveTime = watch('resolveTime');
  const currentType = watch('escalationType');

  useEffect(() => {
    if (initialData) {
      reset({
        escalationType: initialData.escalationType || '',
        description: initialData.description || '',
        escalatedBy: initialData.escalatedBy || '',
        priority: initialData.priority || 'Medium',
        resolveTime: initialData.resolveTime ?? 24
      });
    } else {
      reset({
        escalationType: '',
        description: '',
        escalatedBy: '',
        priority: 'Medium',
        resolveTime: 24
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex min-h-full items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] font-urbanist"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Pinned) */}
        <div className="px-5 sm:px-6 py-3 sm:py-3.5 bg-black text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-red text-white flex items-center justify-center font-bold text-sm shrink-0">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white my-0 leading-snug">
                {isEditMode ? 'Edit Escalation' : 'New Operational Escalation'}
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium my-0">
                {isEditMode
                  ? 'Update escalation details and resolution SLA.'
                  : 'Raise an operational issue with an enforced SLA deadline.'}
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
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin">
          {/* 1. Escalation Type */}
          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Escalation Type <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              {...register('escalationType')}
              placeholder="e.g. Electricity, Internet, Parking, Unannounced Client..."
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.escalationType
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.escalationType && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.escalationType.message}
              </p>
            )}

            {/* Quick Type Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-semibold text-neutral-400">Suggestions:</span>
              {SUGGESTED_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('escalationType', type, { shouldValidate: true })}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                    currentType === type
                      ? 'bg-brand-red text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Description */}
          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Description <span className="text-brand-red">*</span>
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Detailed explanation of the issue, affected floor/unit, and what resolution is required..."
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all resize-none ${
                errors.description
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* 3. Escalated By & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Escalated By <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                {...register('escalatedBy')}
                placeholder="e.g. Aniket / Front Desk"
                className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                  errors.escalatedBy
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-neutral-200 focus:border-brand-red focus:bg-white'
                }`}
              />
              {errors.escalatedBy && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.escalatedBy.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Priority <span className="text-brand-red">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['High', 'Medium', 'Low'].map((p) => {
                  const isSelected = selectedPriority === p;
                  let selectedClass = '';
                  if (isSelected) {
                    if (p === 'High') selectedClass = 'bg-rose-50 text-rose-700 border-rose-400 font-bold';
                    else if (p === 'Medium') selectedClass = 'bg-amber-50 text-amber-700 border-amber-400 font-bold';
                    else selectedClass = 'bg-blue-50 text-blue-700 border-blue-400 font-bold';
                  } else {
                    selectedClass = 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100';
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setValue('priority', p, { shouldValidate: true })}
                      className={`py-2 px-2 text-center rounded-xl text-xs border transition-all cursor-pointer ${selectedClass}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...register('priority')} />
              {errors.priority && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* 4. Resolve Time in Hours */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-black">
                Allowed Resolve Time (Hours) <span className="text-brand-red">*</span>
              </label>
              <span className="text-[11px] text-muted-text">
                Deadline is calculated automatically
              </span>
            </div>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="number"
                step="any"
                min="0.1"
                {...register('resolveTime')}
                placeholder="e.g. 24"
                className={`w-full pl-10 pr-14 py-2.5 bg-neutral-50 border rounded-xl text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                  errors.resolveTime
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-neutral-200 focus:border-brand-red focus:bg-white'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 pointer-events-none">
                Hours
              </span>
            </div>
            {errors.resolveTime && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.resolveTime.message}
              </p>
            )}

            {/* SLA Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-semibold text-neutral-400">Quick presets:</span>
              {RESOLVE_TIME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue('resolveTime', preset, { shouldValidate: true })}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    Number(currentResolveTime) === preset
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {preset}h
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Fixed Footer (Pinned) */}
        <div className="shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-all cursor-pointer disabled:opacity-50 text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-brand-red text-white text-xs font-bold shadow-xs hover:bg-brand-red/90 focus:outline-hidden transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 text-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditMode ? 'Save Changes' : 'Create Escalation'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EscalationModal;
