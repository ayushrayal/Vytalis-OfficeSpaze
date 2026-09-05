import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Upload, X, ExternalLink, AlertCircle, Loader2, Info } from 'lucide-react';
import { validateReceiptFile } from '../utils/utilityBills.utils';

const utilityBillSchema = z.object({
  billName: z.string().trim().min(1, 'Bill name is required'),
  billAmount: z.coerce
    .number({ invalid_type_error: 'Bill amount must be a positive number' })
    .gt(0, 'Bill amount must be greater than 0'),
  uploadedBy: z.string().trim().min(1, 'Uploaded by is required'),
  status: z.enum(['Due', 'Paid'], {
    errorMap: () => ({ message: 'Status must be either "Due" or "Paid"' })
  }),
  isPaused: z.boolean().default(false)
});

const UtilityBillForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
  onPreviewReceipt
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const isEditMode = Boolean(initialData && (initialData.id || initialData._id));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(utilityBillSchema),
    defaultValues: {
      billName: '',
      billAmount: '',
      uploadedBy: '',
      status: 'Due',
      isPaused: false
    }
  });

  const watchIsPaused = watch('isPaused');

  useEffect(() => {
    if (initialData) {
      reset({
        billName: initialData.billName || '',
        billAmount: initialData.billAmount ?? '',
        uploadedBy: initialData.uploadedBy || '',
        status: initialData.status === 'Paid' ? 'Paid' : 'Due',
        isPaused: Boolean(initialData.isPaused)
      });
      setSelectedFile(null);
      setFileError('');
    } else {
      reset({
        billName: '',
        billAmount: '',
        uploadedBy: '',
        status: 'Due',
        isPaused: false
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

    const validation = validateReceiptFile(file);
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
      ...(selectedFile ? { receipt: selectedFile } : {})
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Section 1: Bill Details */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-red border-b border-neutral-100 pb-1.5 my-0">
          Bill Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-black mb-1">
              Bill Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              {...register('billName')}
              placeholder="e.g. Electricity Bill - Tower A"
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.billName
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.billName && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.billName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Bill Amount (₹) <span className="text-brand-red">*</span>
            </label>
            <input
              type="number"
              step="any"
              {...register('billAmount')}
              placeholder="e.g. 15000"
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.billAmount
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.billAmount && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.billAmount.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Uploaded By <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              {...register('uploadedBy')}
              placeholder="e.g. Facility Manager"
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden transition-all ${
                errors.uploadedBy
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-200 focus:border-brand-red focus:bg-white'
              }`}
            />
            {errors.uploadedBy && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.uploadedBy.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Payment Status <span className="text-brand-red">*</span>
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

          <div className="flex items-center gap-2 pt-5 text-xs text-neutral-500 font-medium">
            <Info className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>Reminder Date is automatically calculated by the system.</span>
          </div>
        </div>
      </div>

      {/* Section 2: Receipt Upload */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-red border-b border-neutral-100 pb-1.5 my-0">
          Receipt Attachment (Optional)
        </h4>

        {/* Existing Receipt Display in Edit Mode */}
        {isEditMode && initialData?.receipt?.url && (
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-brand-red shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-black truncate my-0">
                  Current Receipt: {initialData.receipt.fileName}
                </p>
                <p className="text-[10px] text-neutral-500 font-medium">
                  File uploaded on server
                </p>
              </div>
            </div>
            {onPreviewReceipt && (
              <button
                type="button"
                onClick={() => onPreviewReceipt(initialData.receipt)}
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
            {isEditMode && initialData?.receipt?.url
              ? 'Replace Receipt File'
              : 'Upload Receipt File'}
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
                  Click or drag file to upload receipt
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

      {/* Section 3: Recurring & Pause Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-red border-b border-neutral-100 pb-1.5 my-0">
          Recurring Series Settings
        </h4>
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black block">
              Pause Recurring Monthly Series
            </span>
            <p className="text-[11px] text-neutral-500 font-medium my-0">
              Paused bills will not generate the next monthly occurrence until resumed.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={watchIsPaused}
              onChange={(e) => setValue('isPaused', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
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
            <span>{isEditMode ? 'Save Changes' : 'Create Utility Bill'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default UtilityBillForm;
