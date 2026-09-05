import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = React.forwardRef(({ label = 'Password', placeholder = 'Enter password', error, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1 font-urbanist">
      <label className="block text-xs font-semibold uppercase tracking-wider text-black">
        {label}
      </label>
      <div className="relative rounded-md shadow-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-light-gray">
          <Lock className="h-4 w-4" />
        </div>
        <input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={`block w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm text-black placeholder:text-light-gray focus:outline-hidden focus:ring-2 transition-all ${
            error
              ? 'border-brand-red focus:border-brand-red focus:ring-brand-red/20'
              : 'border-border focus:border-brand-red focus:ring-brand-red/20'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-light-gray hover:text-black focus:outline-hidden"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-brand-red mt-1 font-medium">{error}</p>}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
