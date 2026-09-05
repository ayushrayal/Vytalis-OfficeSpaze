import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Paperclip, FileText, Upload, AlertCircle, X } from 'lucide-react';
import { formatDateInput, validateReceiptFile } from '../utils/operationBills.utils';

// Zod Schema for Operation Bill
const operationBillSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  expenseType: z
    .string()
    .min(1, 'Expense type is required')
    .refine((val) => val.trim().length > 0, 'Expense type cannot be whitespace only'),
  uploadedBy: z
    .string()
    .min(1, 'Uploaded by is required')
    .refine((val) => val.trim().length > 0, 'Uploaded by cannot be whitespace only'),
  status: z.enum(['Due', 'Paid'], {
    required_error: 'Status must be either "Due" or "Paid"'
  })
});

const OperationBillForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
  onViewExistingReceipt
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const isEditMode = !!initialData;
  const existingReceipt = initialData?.receipt;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(operationBillSchema),
    defaultValues: {
      date: formatDateInput(initialData?.date || new Date()),
      expenseType: initialData?.expenseType || '',
      uploadedBy: initialData?.uploadedBy || '',
      status: initialData?.status || 'Due'
    }
  });

  useEffect(() => {
    if (initialData) {
      setValue('date', formatDateInput(initialData.date));
      setValue('expenseType', initialData.expenseType || '');
      setValue('uploadedBy', initialData.uploadedBy || '');
      setValue('status', initialData.status || 'Due');
    }
  }, [initialData, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setFileError('');
      return;
    }

    const validation = validateReceiptFile(file);
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
      date: data.date,
      expenseType: data.expenseType.trim(),
      uploadedBy: data.uploadedBy.trim(),
      status: data.status
    };

    if (selectedFile) {
      payload.receipt = selectedFile;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-[#000000] font-urbanist">
      <div className="space-y-4">
        {/* Date & Expense Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Date <span className="text-[#ED1F23]">*</span>
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3.5 py-2.5 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
            />
            {errors.date && (
              <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Expense Type <span className="text-[#ED1F23]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Office Supplies, Maintenance, Internet"
              {...register('expenseType')}
              className="w-full px-3.5 py-2.5 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] placeholder:text-[#505050]/50 focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
            />
            {errors.expenseType && (
              <p className="text-xs text-[#ED1F23] mt-1 font-medium">
                {errors.expenseType.message}
              </p>
            )}
          </div>
        </div>

        {/* Uploaded By & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Uploaded By <span className="text-[#ED1F23]">*</span>
            </label>
            <input
              type="text"
              placeholder="Admin or Manager name"
              {...register('uploadedBy')}
              className="w-full px-3.5 py-2.5 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] placeholder:text-[#505050]/50 focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
            />
            {errors.uploadedBy && (
              <p className="text-xs text-[#ED1F23] mt-1 font-medium">
                {errors.uploadedBy.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#000000] mb-1">
              Status <span className="text-[#ED1F23]">*</span>
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2.5 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] font-medium focus:outline-none focus:border-[#000000] cursor-pointer"
            >
              <option value="Due">Due</option>
              <option value="Paid">Paid</option>
            </select>
            {errors.status && (
              <p className="text-xs text-[#ED1F23] mt-1 font-medium">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Receipt Attachment Section */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Receipt File (Optional)
          </label>
          <p className="text-[11px] text-[#505050] mb-2">
            Accepted formats: PDF, JPG, JPEG, PNG (Max size: 5 MB)
          </p>

          {/* Existing receipt notification during edit */}
          {isEditMode && existingReceipt && (existingReceipt.url || existingReceipt.fileName) && (
            <div className="mb-3 p-3 bg-[#F5F0EB]/60 border border-[#E5E5E5] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-[#000000] shrink-0" />
                <span className="text-xs font-medium text-[#000000] truncate">
                  Current: {existingReceipt.fileName || 'Attached Receipt'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onViewExistingReceipt && onViewExistingReceipt(existingReceipt)}
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
                  {isEditMode && existingReceipt
                    ? 'Click or drag to replace current receipt'
                    : 'Click or drag receipt file to upload'}
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
      </div>

      {/* Form Buttons */}
      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-[#505050] bg-white border border-[#E5E5E5] rounded-xl hover:bg-[#F5F0EB] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-sm font-medium text-white bg-[#000000] hover:bg-[#ED1F23] rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          <span>{isEditMode ? 'Save Changes' : 'Add Operation Bill'}</span>
        </button>
      </div>
    </form>
  );
};

export default OperationBillForm;
