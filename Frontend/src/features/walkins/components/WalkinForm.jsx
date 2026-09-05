import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDateInput } from '../utils/walkin.utils';

const walkinSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .refine((val) => val.trim().length > 0, 'Name cannot be empty whitespace'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((val) => val.trim().length > 0, 'Phone cannot be empty whitespace'),
  email: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim().length === 0) return true;
      return z.string().email().safeParse(val.trim()).success;
    }, 'Please enter a valid email address'),
  date: z
    .string()
    .min(1, 'Walk-in date is required'),
  source: z
    .string()
    .min(1, 'Source is required')
    .refine((val) => val.trim().length > 0, 'Source cannot be empty whitespace'),
  notes: z.string().optional()
});

const COMMON_SOURCES = ['Google', 'Referral', 'Website', 'Walk-in', 'Instagram', 'LinkedIn', 'Phone Inquiry', 'Event'];

const WalkinForm = ({ initialValues, onSubmit, isSubmitting, onCancel }) => {
  const defaultDate = initialValues?.date
    ? formatDateInput(initialValues.date)
    : formatDateInput(new Date());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(walkinSchema),
    defaultValues: {
      name: initialValues?.name || '',
      phone: initialValues?.phone || '',
      email: initialValues?.email || '',
      date: defaultDate,
      source: initialValues?.source || '',
      notes: initialValues?.notes || ''
    }
  });

  const currentSource = watch('source');

  const onFormSubmit = (data) => {
    const formattedPayload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email && data.email.trim() ? data.email.trim().toLowerCase() : '',
      date: data.date,
      source: data.source.trim(),
      notes: data.notes && data.notes.trim() ? data.notes.trim() : ''
    };
    onSubmit(formattedPayload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 font-urbanist">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
          Visitor Name <span className="text-[#ED1F23]">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="e.g. Rahul Sharma"
          className={`w-full px-3.5 py-2.5 bg-neutral-50/60 border rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 transition-all ${
            errors.name ? 'border-[#ED1F23]' : 'border-neutral-200 focus:border-[#ED1F23]'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-[#ED1F23] font-medium">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Phone Number <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="text"
            {...register('phone')}
            placeholder="e.g. +91 9876543210"
            className={`w-full px-3.5 py-2.5 bg-neutral-50/60 border rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 transition-all ${
              errors.phone ? 'border-[#ED1F23]' : 'border-neutral-200 focus:border-[#ED1F23]'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-[#ED1F23] font-medium">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Email Address <span className="text-neutral-400 text-[10px] lowercase">(optional)</span>
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="e.g. rahul@example.com"
            className={`w-full px-3.5 py-2.5 bg-neutral-50/60 border rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 transition-all ${
              errors.email ? 'border-[#ED1F23]' : 'border-neutral-200 focus:border-[#ED1F23]'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-[#ED1F23] font-medium">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Walk-in Date <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="date"
            {...register('date')}
            className={`w-full px-3.5 py-2.5 bg-neutral-50/60 border rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 transition-all ${
              errors.date ? 'border-[#ED1F23]' : 'border-neutral-200 focus:border-[#ED1F23]'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-[#ED1F23] font-medium">{errors.date.message}</p>
          )}
        </div>

        {/* Source (Flexible String Input + Quick Suggestion Pills) */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Source <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="text"
            {...register('source')}
            placeholder="e.g. Google, Walk-in, Referral"
            className={`w-full px-3.5 py-2.5 bg-neutral-50/60 border rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 transition-all ${
              errors.source ? 'border-[#ED1F23]' : 'border-neutral-200 focus:border-[#ED1F23]'
            }`}
          />
          {errors.source && (
            <p className="mt-1 text-xs text-[#ED1F23] font-medium">{errors.source.message}</p>
          )}
          
          {/* Quick source pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_SOURCES.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setValue('source', src, { shouldValidate: true })}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  currentSource === src
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
          Visit Notes <span className="text-neutral-400 text-[10px] lowercase">(optional)</span>
        </label>
        <textarea
          rows={3}
          {...register('notes')}
          placeholder="Additional notes about the visitor or meeting details..."
          className="w-full px-3.5 py-2.5 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all font-urbanist"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-[#ED1F23] text-white text-sm font-semibold hover:bg-[#d0191d] focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 transition-all shadow-xs font-urbanist disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialValues ? 'Update Walk-in' : 'Save Walk-in'}
        </button>
      </div>
    </form>
  );
};

export default WalkinForm;
