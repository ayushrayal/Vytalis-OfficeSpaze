import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InvoiceLineItems from './InvoiceLineItems';
import PaymentOptions from './PaymentOptions';
import BankDetailsForm from './BankDetailsForm';
import {
  formatDateInput,
  calculateInvoiceTotals,
  formatCurrencyINR
} from '../utils/invoiceTemplate.utils';

// Email Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Line Item Schema
const lineItemZodSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .refine((val) => val.trim().length > 0, 'Description cannot be whitespace only'),
  hsnSac: z.string().optional().default(''),
  quantity: z.number({ invalid_type_error: 'Quantity must be a number' }).gt(0, 'Quantity must be > 0'),
  rate: z.number({ invalid_type_error: 'Rate must be a number' }).min(0, 'Rate cannot be negative'),
  taxPercent: z.number().min(0, 'Tax % cannot be negative').optional().default(0)
});

// Full Invoice Template Schema
const invoiceTemplateSchema = z.object({
  businessName: z
    .string()
    .min(1, 'Business name is required')
    .refine((val) => val.trim().length > 0, 'Business name cannot be whitespace only'),
  businessAddress: z
    .string()
    .min(1, 'Business address is required')
    .refine((val) => val.trim().length > 0, 'Business address cannot be whitespace only'),
  gstin: z.string().optional().default(''),
  email: z
    .string()
    .min(1, 'Email address is required')
    .refine((val) => emailRegex.test(val.trim()), 'Valid email address is required'),
  website: z.string().optional().default(''),

  invoiceNumber: z
    .string()
    .min(1, 'Invoice number is required')
    .refine((val) => val.trim().length > 0, 'Invoice number cannot be whitespace only'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  terms: z.string().optional().default(''),
  dueDate: z.string().optional().default(''),
  placeOfSupply: z.string().optional().default(''),

  clientName: z
    .string()
    .min(1, 'Client name is required')
    .refine((val) => val.trim().length > 0, 'Client name cannot be whitespace only'),
  billingAddress: z
    .string()
    .min(1, 'Billing address is required')
    .refine((val) => val.trim().length > 0, 'Billing address cannot be whitespace only'),
  clientGstin: z.string().optional().default(''),

  items: z.array(lineItemZodSchema).min(1, 'At least one line item is required'),

  amountWithheld: z
    .number({ invalid_type_error: 'Amount withheld must be a number' })
    .min(0, 'Amount withheld cannot be negative')
    .optional()
    .default(0),
  totalInWords: z.string().optional().default(''),

  notes: z.string().optional().default(''),
  paymentOptions: z.array(z.any()).optional().default([]),
  bankDetails: z.object({
    accountName: z.string().optional().default(''),
    accountType: z.string().optional().default(''),
    accountNumber: z.string().optional().default(''),
    ifscCode: z.string().optional().default(''),
    bankName: z.string().optional().default(''),
    branch: z.string().optional().default('')
  }).optional().default({}),
  footerMessage: z.string().optional().default('')
});

const InvoiceTemplateForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(invoiceTemplateSchema),
    defaultValues: {
      businessName: initialData?.businessName || '',
      businessAddress: initialData?.businessAddress || '',
      gstin: initialData?.gstin || '',
      email: initialData?.email || '',
      website: initialData?.website || '',
      invoiceNumber: initialData?.invoiceNumber || '',
      invoiceDate: formatDateInput(initialData?.invoiceDate || new Date()),
      terms: initialData?.terms || '',
      dueDate: formatDateInput(initialData?.dueDate || ''),
      placeOfSupply: initialData?.placeOfSupply || '',
      clientName: initialData?.clientName || '',
      billingAddress: initialData?.billingAddress || '',
      clientGstin: initialData?.clientGstin || '',
      items: initialData?.items?.length
        ? initialData.items.map((it) => ({
            description: it.description || '',
            hsnSac: it.hsnSac || '',
            quantity: Number(it.quantity) || 1,
            rate: Number(it.rate) || 0,
            taxPercent: Number(it.taxPercent) || 0
          }))
        : [
            {
              description: '',
              hsnSac: '',
              quantity: 1,
              rate: 0,
              taxPercent: 0
            }
          ],
      amountWithheld: Number(initialData?.amountWithheld) || 0,
      totalInWords: initialData?.totalInWords || '',
      notes: initialData?.notes || '',
      paymentOptions: initialData?.paymentOptions || [],
      bankDetails: {
        accountName: initialData?.bankDetails?.accountName || '',
        accountType: initialData?.bankDetails?.accountType || '',
        accountNumber: initialData?.bankDetails?.accountNumber || '',
        ifscCode: initialData?.bankDetails?.ifscCode || '',
        bankName: initialData?.bankDetails?.bankName || '',
        branch: initialData?.bankDetails?.branch || ''
      },
      footerMessage: initialData?.footerMessage || ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items') || [];
  const watchWithheld = watch('amountWithheld') || 0;
  const calculatedTotals = calculateInvoiceTotals(watchItems, watchWithheld);

  useEffect(() => {
    if (initialData) {
      reset({
        businessName: initialData.businessName || '',
        businessAddress: initialData.businessAddress || '',
        gstin: initialData.gstin || '',
        email: initialData.email || '',
        website: initialData.website || '',
        invoiceNumber: initialData.invoiceNumber || '',
        invoiceDate: formatDateInput(initialData.invoiceDate),
        terms: initialData.terms || '',
        dueDate: formatDateInput(initialData.dueDate),
        placeOfSupply: initialData.placeOfSupply || '',
        clientName: initialData.clientName || '',
        billingAddress: initialData.billingAddress || '',
        clientGstin: initialData.clientGstin || '',
        items: initialData.items?.length
          ? initialData.items.map((it) => ({
              description: it.description || '',
              hsnSac: it.hsnSac || '',
              quantity: Number(it.quantity) || 1,
              rate: Number(it.rate) || 0,
              taxPercent: Number(it.taxPercent) || 0
            }))
          : [{ description: '', hsnSac: '', quantity: 1, rate: 0, taxPercent: 0 }],
        amountWithheld: Number(initialData.amountWithheld) || 0,
        totalInWords: initialData.totalInWords || '',
        notes: initialData.notes || '',
        paymentOptions: initialData.paymentOptions || [],
        bankDetails: {
          accountName: initialData.bankDetails?.accountName || '',
          accountType: initialData.bankDetails?.accountType || '',
          accountNumber: initialData.bankDetails?.accountNumber || '',
          ifscCode: initialData.bankDetails?.ifscCode || '',
          bankName: initialData.bankDetails?.bankName || '',
          branch: initialData.bankDetails?.branch || ''
        },
        footerMessage: initialData.footerMessage || ''
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const payload = {
      businessName: data.businessName.trim(),
      businessAddress: data.businessAddress.trim(),
      gstin: data.gstin ? data.gstin.trim() : '',
      email: data.email.trim().toLowerCase(),
      website: data.website ? data.website.trim() : '',

      invoiceNumber: data.invoiceNumber.trim(),
      invoiceDate: data.invoiceDate,
      terms: data.terms ? data.terms.trim() : '',
      dueDate: data.dueDate || null,
      placeOfSupply: data.placeOfSupply ? data.placeOfSupply.trim() : '',

      clientName: data.clientName.trim(),
      billingAddress: data.billingAddress.trim(),
      clientGstin: data.clientGstin ? data.clientGstin.trim() : '',

      items: data.items.map((it) => ({
        description: it.description.trim(),
        hsnSac: it.hsnSac ? it.hsnSac.trim() : '',
        quantity: Number(it.quantity),
        rate: Number(it.rate),
        taxPercent: Number(it.taxPercent || 0)
      })),

      amountWithheld: Number(data.amountWithheld || 0),
      totalInWords: data.totalInWords ? data.totalInWords.trim() : '',

      notes: data.notes ? data.notes.trim() : '',
      paymentOptions: data.paymentOptions || [],
      bankDetails: {
        accountName: data.bankDetails?.accountName ? data.bankDetails.accountName.trim() : '',
        accountType: data.bankDetails?.accountType ? data.bankDetails.accountType.trim() : '',
        accountNumber: data.bankDetails?.accountNumber ? data.bankDetails.accountNumber.trim() : '',
        ifscCode: data.bankDetails?.ifscCode ? data.bankDetails.ifscCode.trim() : '',
        bankName: data.bankDetails?.bankName ? data.bankDetails.bankName.trim() : '',
        branch: data.bankDetails?.branch ? data.bankDetails.branch.trim() : ''
      },
      footerMessage: data.footerMessage ? data.footerMessage.trim() : ''
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 font-urbanist">
      {/* 1. Company Details */}
      <div className="space-y-3 p-4 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl">
        <h4 className="text-xs font-bold text-[#000000] uppercase tracking-wider">
          Company Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Business Name *
            </label>
            <input
              type="text"
              placeholder="Vytalis Spaze"
              {...register('businessName')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
            {errors.businessName && (
              <p className="text-[11px] text-[#ED1F23] mt-1 font-medium">{errors.businessName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="billing@vytalis.com"
              {...register('email')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
            {errors.email && (
              <p className="text-[11px] text-[#ED1F23] mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#505050] mb-1">
            Business Address *
          </label>
          <textarea
            rows={2}
            placeholder="Complete registered business address"
            {...register('businessAddress')}
            className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
          {errors.businessAddress && (
            <p className="text-[11px] text-[#ED1F23] mt-1 font-medium">{errors.businessAddress.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Company GSTIN (Optional)
            </label>
            <input
              type="text"
              placeholder="07AAAAA0000A1Z5"
              {...register('gstin')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Website (Optional)
            </label>
            <input
              type="text"
              placeholder="https://vytalis.com"
              {...register('website')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
          </div>
        </div>
      </div>

      {/* 2. Invoice Details */}
      <div className="space-y-3 p-4 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl">
        <h4 className="text-xs font-bold text-[#000000] uppercase tracking-wider">
          Invoice Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Invoice Number *
            </label>
            <input
              type="text"
              placeholder="INV-2026-001"
              {...register('invoiceNumber')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
            {errors.invoiceNumber && (
              <p className="text-[11px] text-[#ED1F23] mt-1 font-medium">{errors.invoiceNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Invoice Date *
            </label>
            <input
              type="date"
              {...register('invoiceDate')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
            {errors.invoiceDate && (
              <p className="text-[11px] text-[#ED1F23] mt-1 font-medium">{errors.invoiceDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Terms (Optional)
            </label>
            <input
              type="text"
              placeholder="Due on Receipt / Net 30"
              {...register('terms')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Place of Supply (Optional)
            </label>
            <input
              type="text"
              placeholder="Delhi (07)"
              {...register('placeOfSupply')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
          </div>
        </div>
      </div>

      {/* 3. Client Details */}
      <div className="space-y-3 p-4 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl">
        <h4 className="text-xs font-bold text-[#000000] uppercase tracking-wider">
          Client Details (Bill To)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Client Name *
            </label>
            <input
              type="text"
              placeholder="Acme Corp"
              {...register('clientName')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
            {errors.clientName && (
              <p className="text-[11px] text-[#ED1F23] mt-1 font-medium">{errors.clientName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#505050] mb-1">
              Client GSTIN (Optional)
            </label>
            <input
              type="text"
              placeholder="07BBBBB1111B2Z6"
              {...register('clientGstin')}
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#505050] mb-1">
            Billing Address *
          </label>
          <textarea
            rows={2}
            placeholder="Client complete billing address"
            {...register('billingAddress')}
            className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
          {errors.billingAddress && (
            <p className="text-[11px] text-[#ED1F23] mt-1 font-medium">{errors.billingAddress.message}</p>
          )}
        </div>
      </div>

      {/* 4. Line Items */}
      <div className="p-4 bg-[#F5F0EB]/20 border border-[#E5E5E5] rounded-xl">
        <InvoiceLineItems
          fields={fields}
          append={append}
          remove={remove}
          register={register}
          watch={watch}
          errors={errors}
        />
      </div>

      {/* 5. Totals & Calculations Display */}
      <div className="p-4 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-xl space-y-4">
        <h4 className="text-xs font-bold text-[#000000] uppercase tracking-wider">
          Invoice Calculations & TDS
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#505050] mb-1">
                Amount Withheld / TDS (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                {...register('amountWithheld', { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
              />
              {errors.amountWithheld && (
                <p className="text-[11px] text-[#ED1F23] mt-1 font-medium">{errors.amountWithheld.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#505050] mb-1">
                Total in Words (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Eleven Thousand Eight Hundred Only"
                {...register('totalInWords')}
                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
              />
            </div>
          </div>

          {/* Real-time Calculated Summary Box */}
          <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-[#505050]">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#000000]">{formatCurrencyINR(calculatedTotals.subTotal)}</span>
            </div>
            <div className="flex justify-between text-[#505050]">
              <span>Tax Total:</span>
              <span className="font-semibold text-[#000000]">{formatCurrencyINR(calculatedTotals.taxTotal)}</span>
            </div>
            <div className="flex justify-between text-[#000000] font-bold text-sm pt-1 border-t border-[#E5E5E5]">
              <span>Grand Total:</span>
              <span>{formatCurrencyINR(calculatedTotals.total)}</span>
            </div>
            <div className="flex justify-between text-[#ED1F23] font-semibold">
              <span>Less TDS / Withheld:</span>
              <span>- {formatCurrencyINR(calculatedTotals.amountWithheld)}</span>
            </div>
            <div className="flex justify-between text-[#000000] font-extrabold text-base pt-2 border-t-2 border-[#000000]">
              <span>Balance Due:</span>
              <span>{formatCurrencyINR(calculatedTotals.balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Payment Options */}
      <div className="p-4 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl">
        <PaymentOptions watch={watch} setValue={setValue} />
      </div>

      {/* 7. Bank Details */}
      <div className="p-4 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl">
        <BankDetailsForm register={register} />
      </div>

      {/* 8. Notes & Footer Message */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Special instructions, terms, or notes to client"
            {...register('notes')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#000000] mb-1">
            Footer Message (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Thank you for your business!"
            {...register('footerMessage')}
            className="w-full px-3.5 py-2 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
        </div>
      </div>

      {/* Form Submit Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-[#E5E5E5]">
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
          <span>{isEditMode ? 'Save Changes' : 'Create Invoice Template'}</span>
        </button>
      </div>
    </form>
  );
};

export default InvoiceTemplateForm;
