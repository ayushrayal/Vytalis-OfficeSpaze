import React from 'react';

const allowedOptions = ['Bank Transfer', 'UPI', 'Wallet', 'Other'];

const PaymentOptions = ({ watch, setValue }) => {
  const currentOptions = watch('paymentOptions') || [];

  const handleToggle = (name, isChecked) => {
    const existingIndex = currentOptions.findIndex((opt) => opt.name === name);
    let updated = [...currentOptions];

    if (existingIndex > -1) {
      updated[existingIndex] = { name, enabled: isChecked };
    } else {
      updated.push({ name, enabled: isChecked });
    }

    setValue('paymentOptions', updated, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-2 font-urbanist">
      <label className="block text-xs font-semibold text-[#000000] mb-1">
        Payment Options (Check enabled options)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {allowedOptions.map((name) => {
          const isEnabled = currentOptions.some(
            (opt) => opt.name === name && opt.enabled
          );

          return (
            <label
              key={name}
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                isEnabled
                  ? 'bg-black/5 border-[#000000] text-[#000000] font-semibold'
                  : 'bg-[#F5F0EB]/30 border-[#E5E5E5] text-[#505050] hover:border-[#000000]/30'
              }`}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => handleToggle(name, e.target.checked)}
                className="w-4 h-4 text-[#000000] rounded focus:ring-[#000000]"
              />
              <span className="text-xs">{name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentOptions;
