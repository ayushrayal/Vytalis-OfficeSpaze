import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { formatDateInput, validateAgreementFile } from '../utils/coworkSpace.utils';

// Email Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Zod Schema for Cowork Space Form
const coworkSpaceSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .refine((val) => val.trim().length > 0, 'First name cannot be whitespace only'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .refine((val) => val.trim().length > 0, 'Last name cannot be whitespace only'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .refine((val) => val.trim().length > 0, 'Phone number cannot be whitespace only'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .refine((val) => emailRegex.test(val.trim()), 'Valid email address is required'),
    businessType: z.enum(['Registor', 'Non Registor'], {
      required_error: 'Business type must be either "Registor" or "Non Registor"'
    }),
    addedDate: z.string().min(1, 'Added date is required'),
    totalSeats: z
      .string()
      .min(1, 'Total seats is required')
      .refine((val) => {
        const num = Number(val.trim());
        return !isNaN(num) && Number.isInteger(num) && num > 0;
      }, 'Total seats must be a positive integer greater than 0'),
    seatPerCost: z
      .string()
      .min(1, 'Seat per cost is required')
      .refine((val) => {
        const num = Number(val.trim());
        return !isNaN(num) && num > 0;
      }, 'Seat per cost must be a positive number greater than 0'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required')
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      const s = new Date(data.startDate);
      const e = new Date(data.endDate);
      return e >= s;
    },
    {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate']
    }
  );

const CoworkSpaceForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
  onViewExistingAgreement
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const isEditMode = !!initialData;
  const existingAgreement = initialData?.agreement;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(coworkSpaceSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      businessType: initialData?.businessType || 'Registor',
      addedDate: formatDateInput(initialData?.addedDate || new Date()),
      totalSeats: initialData?.totalSeats ? String(initialData.totalSeats) : '1',
      seatPerCost: initialData?.seatPerCost ? String(initialData.seatPerCost) : '',
      startDate: formatDateInput(initialData?.startDate || new Date()),
      endDate: formatDateInput(initialData?.endDate || '')
    }
  });

  useEffect(() => {
    if (initialData) {
      setValue('firstName', initialData.firstName || '');
      setValue('lastName', initialData.lastName || '');
      setValue('phone', initialData.phone || '');
      setValue('email', initialData.email || '');
      setValue('businessType', initialData.businessType || 'Registor');
      setValue('addedDate', formatDateInput(initialData.addedDate));
      setValue('totalSeats', String(initialData.totalSeats || '1'));
      setValue('seatPerCost', String(initialData.seatPerCost || ''));
      setValue('startDate', formatDateInput(initialData.startDate));
      setValue('endDate', formatDateInput(initialData.endDate));
    }
  }, [initialData, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setFileError('');
      return;
    }

    const validation = validateAgreementFile(file);
    if (!validation.valid) {
      setFileError(validation.error);
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setFileError('');
    setSelectedFile(file);
  };

  const handleFormSubmit = (data) => {
    if (fileError) return;

    const payload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
      businessType: data.businessType,
      addedDate: data.addedDate,
      totalSeats: Number(data.totalSeats.trim()),
      seatPerCost: Number(data.seatPerCost.trim()),
      startDate: data.startDate,
      endDate: data.endDate
    };

    if (selectedFile) {
      payload.agreement = selectedFile;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 font-urbanist">
      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            First Name <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="text"
            placeholder="John"
            {...register('firstName')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] placeholder:text-[#505050]/50 focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {errors.firstName && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Last Name <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="text"
            placeholder="Doe"
            {...register('lastName')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] placeholder:text-[#505050]/50 focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {errors.lastName && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Phone Number <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="text"
            placeholder="+91 9876543210"
            {...register('phone')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] placeholder:text-[#505050]/50 focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {errors.phone && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Email Address <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="email"
            placeholder="john.doe@company.com"
            {...register('email')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] placeholder:text-[#505050]/50 focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Business Type & Added Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Business Type <span className="text-[#ED1F23]">*</span>
          </label>
          <select
            {...register('businessType')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] font-medium focus:outline-none focus:border-[#000000] cursor-pointer"
          >
            <option value="Registor">Registor</option>
            <option value="Non Registor">Non Registor</option>
          </select>
          {errors.businessType && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.businessType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Added Date <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="date"
            {...register('addedDate')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {errors.addedDate && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.addedDate.message}</p>
          )}
        </div>
      </div>

      {/* Seats & Cost */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Total Seats <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 5"
            {...register('totalSeats')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] placeholder:text-[#505050]/50 focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {errors.totalSeats && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.totalSeats.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Seat Per Cost (₹) <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            step="any"
            placeholder="e.g. 2500"
            {...register('seatPerCost')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] placeholder:text-[#505050]/50 focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {errors.seatPerCost && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.seatPerCost.message}</p>
          )}
        </div>
      </div>

      {/* Start Date & End Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Start Date <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {errors.startDate && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            End Date <span className="text-[#ED1F23]">*</span>
          </label>
          <input
            type="date"
            {...register('endDate')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {errors.endDate && (
            <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Agreement Attachment Section */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-[#000000] mb-1">
          Agreement Document (Optional)
        </label>
        <p className="text-[11px] text-[#505050] mb-2">
          Accepted formats: PDF, JPG, JPEG, PNG (Max size: 5 MB)
        </p>

        {/* Existing agreement notification during edit */}
        {isEditMode && existingAgreement && (existingAgreement.url || existingAgreement.fileName) && (
          <div className="mb-3 p-3 bg-[#F5F0EB]/60 border border-[#E5E5E5] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-[#000000] shrink-0" />
              <span className="text-xs font-medium text-[#000000] truncate">
                Current: {existingAgreement.fileName || 'Attached Agreement'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onViewExistingAgreement && onViewExistingAgreement(existingAgreement)}
              className="text-xs text-[#ED1F23] font-semibold hover:underline shrink-0 ml-2"
            >
              View
            </button>
          </div>
        )}

        {/* Upload Input Box */}
        <div className="relative border-2 border-dashed border-[#E5E5E5] hover:border-[#000000] rounded-xl p-4 text-center transition-colors bg-[#F5F0EB]/20">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <Upload className="w-5 h-5 text-[#505050]" />
            {selectedFile ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <FileText className="w-4 h-4" />
                <span>{selectedFile.name}</span>
                <span className="text-[10px] text-[#505050]">
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#505050]">
                {isEditMode && existingAgreement
                  ? 'Click or drag to replace current agreement'
                  : 'Click or drag agreement file to upload'}
              </span>
            )}
          </div>
        </div>

        {fileError && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[#ED1F23] font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}
      </div>

      {/* Form Buttons */}
      <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-[#E5E5E5]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-[#505050] bg-white border border-[#E5E5E5] rounded-xl hover:bg-[#F5F0EB] transition-colors text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-sm font-medium text-white bg-[#000000] hover:bg-[#ED1F23] rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-center"
        >
          {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          <span>{isEditMode ? 'Save Changes' : 'Add Cowork Space'}</span>
        </button>
      </div>
    </form>
  );
};

export default CoworkSpaceForm;
