import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Upload, X, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { formatDateInput, validateAgreementFile } from '../utils/virtualOffices.utils';

const virtualOfficeSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    phone: z.string().trim().min(1, 'Phone number is required'),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Valid email address is required'),
    companyName: z.string().trim().min(1, 'Company name is required'),
    companyRegisteredAddress: z
      .string()
      .trim()
      .min(1, 'Company registered address is required'),
    allottedVirtualAddress: z
      .string()
      .trim()
      .min(1, 'Allotted virtual address is required'),
    allottedBy: z.string().trim().min(1, 'Allotted by is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    paymentMadeOn: z.string().min(1, 'Payment date is required'),
    agreedCommercials: z.coerce
      .number({ invalid_type_error: 'Agreed commercials must be a positive number' })
      .gt(0, 'Agreed commercials must be greater than 0')
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate']
    }
  );

const VirtualOfficeForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
  onPreviewAgreement
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const isEditMode = Boolean(initialData && (initialData.id || initialData._id));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(virtualOfficeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      companyName: '',
      companyRegisteredAddress: '',
      allottedVirtualAddress: '',
      allottedBy: '',
      startDate: '',
      endDate: '',
      paymentMadeOn: '',
      agreedCommercials: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        companyName: initialData.companyName || '',
        companyRegisteredAddress: initialData.companyRegisteredAddress || '',
        allottedVirtualAddress: initialData.allottedVirtualAddress || '',
        allottedBy: initialData.allottedBy || '',
        startDate: formatDateInput(initialData.startDate),
        endDate: formatDateInput(initialData.endDate),
        paymentMadeOn: formatDateInput(initialData.paymentMadeOn),
        agreedCommercials: initialData.agreedCommercials ?? ''
      });
      setSelectedFile(null);
      setFileError('');
    } else {
      reset({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        companyName: '',
        companyRegisteredAddress: '',
        allottedVirtualAddress: '',
        allottedBy: '',
        startDate: '',
        endDate: '',
        paymentMadeOn: '',
        agreedCommercials: ''
      });
      setSelectedFile(null);
      setFileError('');
    }
  }, [initialData, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validation = validateAgreementFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file format or size');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setFileError('');
  };

  const onFormSubmit = (data) => {
    if (fileError) return;

    const payload = {
      ...data,
      ...(selectedFile ? { agreement: selectedFile } : {})
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* 1. Personal Details */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-red border-b border-neutral-100 pb-1.5 my-0">
          Personal Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              First Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              {...register('firstName')}
              placeholder="e.g. Rahul"
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.firstName
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.firstName && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Last Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              {...register('lastName')}
              placeholder="e.g. Sharma"
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.lastName
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.lastName && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.lastName.message}
              </p>
            )}
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Email Address <span className="text-brand-red">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. rahul@company.com"
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
      </div>

      {/* 2. Company Details */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-red border-b border-neutral-100 pb-1.5 my-0">
          Company Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-black mb-1">
              Company Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              {...register('companyName')}
              placeholder="e.g. Acme Innovations Pvt Ltd"
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.companyName
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.companyName && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-black mb-1">
              Company Registered Address <span className="text-brand-red">*</span>
            </label>
            <textarea
              rows={2}
              {...register('companyRegisteredAddress')}
              placeholder="Official registered company address..."
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all resize-none ${
                errors.companyRegisteredAddress
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.companyRegisteredAddress && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.companyRegisteredAddress.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-black mb-1">
              Allotted Virtual Address <span className="text-brand-red">*</span>
            </label>
            <textarea
              rows={2}
              {...register('allottedVirtualAddress')}
              placeholder="Virtual address assigned to client..."
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all resize-none ${
                errors.allottedVirtualAddress
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.allottedVirtualAddress && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.allottedVirtualAddress.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-black mb-1">
              Allotted By <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              {...register('allottedBy')}
              placeholder="e.g. Admin / Manager Name"
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.allottedBy
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.allottedBy && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.allottedBy.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Dates & Commercials */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-red border-b border-neutral-100 pb-1.5 my-0">
          Agreement & Dates
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Start Date <span className="text-brand-red">*</span>
            </label>
            <input
              type="date"
              {...register('startDate')}
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black focus:outline-hidden transition-all ${
                errors.startDate
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.startDate && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              End Date <span className="text-brand-red">*</span>
            </label>
            <input
              type="date"
              {...register('endDate')}
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black focus:outline-hidden transition-all ${
                errors.endDate
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.endDate && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.endDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Agreed Commercials (₹) <span className="text-brand-red">*</span>
            </label>
            <input
              type="number"
              step="any"
              {...register('agreedCommercials')}
              placeholder="e.g. 25000"
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.agreedCommercials
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.agreedCommercials && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.agreedCommercials.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Payment Made On <span className="text-brand-red">*</span>
            </label>
            <input
              type="date"
              {...register('paymentMadeOn')}
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black focus:outline-hidden transition-all ${
                errors.paymentMadeOn
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.paymentMadeOn && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.paymentMadeOn.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Agreement Upload Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-red border-b border-neutral-100 pb-1.5 my-0">
          Agreement Document (Optional)
        </h4>

        {/* Existing Agreement Display in Edit Mode */}
        {isEditMode && initialData?.agreement?.url && (
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-brand-red shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-black truncate my-0">
                  Current Agreement: {initialData.agreement.fileName}
                </p>
                <p className="text-[10px] text-neutral-500 font-medium">
                  File uploaded on server
                </p>
              </div>
            </div>
            {onPreviewAgreement && (
              <button
                type="button"
                onClick={() => onPreviewAgreement(initialData.agreement)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-black text-black text-xs font-semibold transition-all shrink-0 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>View</span>
              </button>
            )}
          </div>
        )}

        {/* File Input Box */}
        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            {isEditMode && initialData?.agreement?.url
              ? 'Replace Agreement File'
              : 'Upload Agreement File'}
          </label>
          <div className="relative border-2 border-dashed border-neutral-200 hover:border-brand-red rounded-xl p-4 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-all">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {selectedFile ? (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-neutral-200 z-20 relative">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-brand-red shrink-0" />
                  <span className="text-xs font-semibold text-black truncate">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSelectedFile}
                  className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                  title="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-6 h-6 text-neutral-400 mx-auto" />
                <p className="text-xs font-semibold text-neutral-700 my-0">
                  Click or drag file to upload
                </p>
                <p className="text-[11px] text-neutral-400 font-medium my-0">
                  PDF, JPG, JPEG, PNG (Max 5 MB)
                </p>
              </div>
            )}
          </div>

          {fileError && (
            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {fileError}
            </p>
          )}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold shadow-xs hover:bg-brand-red/90 focus:outline-hidden transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEditMode ? 'Save Changes' : 'Create Virtual Office'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default VirtualOfficeForm;
