import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { calculateItemCalculations, formatCurrencyINR } from '../utils/invoiceTemplate.utils';

const InvoiceLineItems = ({
  fields = [],
  append,
  remove,
  register,
  watch,
  errors = {}
}) => {
  const itemsWatch = watch('items') || [];

  return (
    <div className="space-y-4 font-urbanist">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#000000] uppercase tracking-wider">
          Line Items <span className="text-[#ED1F23]">*</span>
        </h3>
        <button
          type="button"
          onClick={() =>
            append({
              description: '',
              hsnSac: '',
              quantity: 1,
              rate: 0,
              taxPercent: 0
            })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#000000] hover:bg-[#ED1F23] rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((fieldItem, index) => {
          const currentItem = itemsWatch[index] || {};
          const calc = calculateItemCalculations(currentItem);
          const itemError = errors?.items?.[index];

          return (
            <div
              key={fieldItem.id}
              className="p-4 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl space-y-3 relative group"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                {/* Description */}
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-semibold text-[#505050] mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    placeholder="Item or service description"
                    {...register(`items.${index}.description`)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
                  />
                  {itemError?.description && (
                    <p className="text-[11px] text-[#ED1F23] mt-1">
                      {itemError.description.message}
                    </p>
                  )}
                </div>

                {/* HSN/SAC */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#505050] mb-1">
                    HSN/SAC
                  </label>
                  <input
                    type="text"
                    placeholder="998311"
                    {...register(`items.${index}.hsnSac`)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
                  />
                </div>

                {/* Qty */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#505050] mb-1">
                    Qty *
                  </label>
                  <input
                    type="number"
                    min="0.0001"
                    step="any"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
                  />
                  {itemError?.quantity && (
                    <p className="text-[11px] text-[#ED1F23] mt-1">
                      {itemError.quantity.message}
                    </p>
                  )}
                </div>

                {/* Rate */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#505050] mb-1">
                    Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    {...register(`items.${index}.rate`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
                  />
                  {itemError?.rate && (
                    <p className="text-[11px] text-[#ED1F23] mt-1">
                      {itemError.rate.message}
                    </p>
                  )}
                </div>

                {/* Tax % */}
                <div className="md:col-span-1">
                  <label className="block text-[11px] font-semibold text-[#505050] mb-1">
                    Tax %
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    {...register(`items.${index}.taxPercent`, { valueAsNumber: true })}
                    className="w-full px-2.5 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
                  />
                </div>

                {/* Delete Button */}
                <div className="md:col-span-1 flex justify-end pt-6">
                  <button
                    type="button"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length <= 1}
                    className="p-1.5 text-[#505050] hover:text-[#ED1F23] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#505050]"
                    title={fields.length <= 1 ? 'At least 1 item is required' : 'Remove Item'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time Calculated Sub-Row */}
              <div className="flex items-center justify-end gap-6 text-xs text-[#505050] pt-1 border-t border-[#E5E5E5]/60">
                <div>
                  Tax Amount: <span className="font-semibold text-[#000000]">{formatCurrencyINR(calc.taxAmount)}</span>
                </div>
                <div>
                  Line Total: <span className="font-bold text-[#000000]">{formatCurrencyINR(calc.lineAmount)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvoiceLineItems;
