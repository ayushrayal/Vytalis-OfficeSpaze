import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, Key, Loader2, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../hooks/useAuth';
import PasswordInput from './PasswordInput';
import { ROUTES } from '../../../routes/routeConfig';

const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .refine((val) => val.trim().length > 0, 'Full name cannot be empty'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    accessCode: z.string().min(1, 'Admin access code is required')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

const SignupForm = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      accessCode: ''
    }
  });

  useGSAP(
    () => {
      gsap.fromTo(
        '.anim-element',
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out'
        }
      );
    },
    { scope: containerRef }
  );

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);

    try {
      // Do NOT send confirmPassword to backend
      const response = await signup({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        accessCode: data.accessCode.trim()
      });

      if (response.success) {
        if (response.autoLoginSuccess !== false) {
          toast.success('Account created successfully. Welcome to Office Spaze!');
          navigate(ROUTES.DASHBOARD, { replace: true });
        } else {
          toast.success(response.message || 'Account created successfully.');
          navigate(ROUTES.LOGIN, { replace: true });
        }
      } else {
        const msg = response.message || 'Signup failed. Please try again.';
        setServerError(msg);
        toast.error(msg);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Unable to complete registration. Please check your credentials or access code.';
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-md mx-auto font-urbanist">
      {serverError && (
        <div className="anim-element mb-5 p-3.5 rounded-lg bg-soft-red border border-brand-red/20 text-brand-red text-sm font-medium flex items-center justify-between">
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="anim-element space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-black">
            Full Name
          </label>
          <div className="relative rounded-md shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-light-gray">
              <User className="h-4 w-4" />
            </div>
            <input
              {...register('name')}
              type="text"
              placeholder="e.g. Alex Morgan"
              className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-black placeholder:text-light-gray focus:outline-hidden focus:ring-2 transition-all ${
                errors.name
                  ? 'border-brand-red focus:border-brand-red focus:ring-brand-red/20'
                  : 'border-border focus:border-brand-red focus:ring-brand-red/20'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-brand-red mt-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="anim-element space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-black">
            Email Address
          </label>
          <div className="relative rounded-md shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-light-gray">
              <Mail className="h-4 w-4" />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@officespaze.com"
              className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-black placeholder:text-light-gray focus:outline-hidden focus:ring-2 transition-all ${
                errors.email
                  ? 'border-brand-red focus:border-brand-red focus:ring-brand-red/20'
                  : 'border-border focus:border-brand-red focus:ring-brand-red/20'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-brand-red mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="anim-element">
          <PasswordInput
            {...register('password')}
            label="Password"
            placeholder="Create password (min 6 chars)"
            error={errors.password?.message}
          />
        </div>

        {/* Confirm Password */}
        <div className="anim-element">
          <PasswordInput
            {...register('confirmPassword')}
            label="Confirm Password"
            placeholder="Re-enter password"
            error={errors.confirmPassword?.message}
          />
        </div>

        {/* Admin Access Code */}
        <div className="anim-element space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-black">
            Admin Access Code
          </label>
          <div className="relative rounded-md shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-light-gray">
              <Key className="h-4 w-4" />
            </div>
            <input
              {...register('accessCode')}
              type="password"
              placeholder="Enter authorization code"
              className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-black placeholder:text-light-gray focus:outline-hidden focus:ring-2 transition-all ${
                errors.accessCode
                  ? 'border-brand-red focus:border-brand-red focus:ring-brand-red/20'
                  : 'border-border focus:border-brand-red focus:ring-brand-red/20'
              }`}
            />
          </div>
          {errors.accessCode && (
            <p className="text-xs text-brand-red mt-1 font-medium">{errors.accessCode.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="anim-element pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative flex items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#D0181C] active:bg-[#B51215] focus:outline-hidden focus:ring-2 focus:ring-brand-red/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Admin Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
