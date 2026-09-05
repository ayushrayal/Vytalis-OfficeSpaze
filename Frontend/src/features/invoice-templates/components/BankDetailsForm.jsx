import React from 'react';

const BankDetailsForm = ({ register }) => {
  return (
    <div className="space-y-3 font-urbanist pt-2">
      <h4 className="text-xs font-bold text-[#000000] uppercase tracking-wider">
        Bank Details (Optional)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#505050] mb-1">
            Account Name
          </label>
          <input
            type="text"
            placeholder="Vytalis Spaze Pvt Ltd"
            {...register('bankDetails.accountName')}
            className="w-full px-3 py-2 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#505050] mb-1">
            Account Type
          </label>
          <input
            type="text"
            placeholder="Current / Savings"
            {...register('bankDetails.accountType')}
            className="w-full px-3 py-2 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#505050] mb-1">
            Account Number
          </label>
          <input
            type="text"
            placeholder="98765432101234"
            {...register('bankDetails.accountNumber')}
            className="w-full px-3 py-2 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#505050] mb-1">
            IFSC Code
          </label>
          <input
            type="text"
            placeholder="HDFC0001234"
            {...register('bankDetails.ifscCode')}
            className="w-full px-3 py-2 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#505050] mb-1">
            Bank Name
          </label>
          <input
            type="text"
            placeholder="HDFC Bank"
            {...register('bankDetails.bankName')}
            className="w-full px-3 py-2 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#505050] mb-1">
            Branch
          </label>
          <input
            type="text"
            placeholder="Cyber City Branch"
            {...register('bankDetails.branch')}
            className="w-full px-3 py-2 bg-[#F5F0EB]/30 border border-[#E5E5E5] rounded-xl text-sm text-[#000000] focus:outline-none focus:border-[#000000]"
          />
        </div>
      </div>
    </div>
  );
};

export default BankDetailsForm;
