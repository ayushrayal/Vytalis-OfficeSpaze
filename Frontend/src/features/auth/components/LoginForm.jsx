import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Loader2, ArrowRight, Clock } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../hooks/useAuth';
import {
  useRateLimitCooldown,
  extractRetryAfterSeconds,
  extractRateLimitPolicy,
  extractRateLimitRemaining
} from '../hooks/useRateLimitCooldown';
import PasswordInput from './PasswordInput';
import RateLimitAlert from './RateLimitAlert';
import { ROUTES } from '../../../routes/routeConfig';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef(null);

  const {
    isRateLimited,
    secondsRemaining,
    formattedCountdown,
    policyText,
    remainingAttempts,
    startCooldown
  } = useRateLimitCooldown();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
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
          stagger: 0.08,
          ease: 'power2.out'
        }
      );
    },
    { scope: containerRef }
  );

  const onSubmit = async (data) => {
    if (isRateLimited) return;
    setServerError('');
    setIsSubmitting(true);

    try {
      const response = await login(data);
      if (response.success) {
        toast.success('Login successful. Welcome to OfficeSpaze!');
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        setServerError(response.message || 'Invalid credentials');
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfterSecs = extractRetryAfterSeconds(error);
        const policy = extractRateLimitPolicy(error, 'login');
        const remaining = extractRateLimitRemaining(error);
        startCooldown(retryAfterSecs, { policyText: policy, remainingAttempts: remaining });
        setServerError('');
        toast.error('Too many login attempts. Login temporarily paused.');
      } else {
        const message =
          error.response?.data?.message ||
          'Unable to connect to the server. Please try again.';
        setServerError(message);
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-md mx-auto">
      {isRateLimited ? (
        <RateLimitAlert
          title="Too many login attempts"
          description="For your security, login has been temporarily paused."
          policyText={policyText || '10 login attempts are allowed every 15 minutes.'}
          remainingAttempts={remainingAttempts}
          secondsRemaining={secondsRemaining}
          formattedCountdown={formattedCountdown}
        />
      ) : serverError ? (
        <div
          role="alert"
          className="anim-element mb-5 p-3.5 rounded-lg bg-soft-red border border-brand-red/20 text-brand-red text-sm font-medium flex items-center justify-between"
        >
          <span>{serverError}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email Field */}
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
              disabled={isRateLimited}
              placeholder="admin@officespaze.com"
              className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-black placeholder:text-light-gray focus:outline-hidden focus:ring-2 transition-all disabled:bg-neutral-50 disabled:text-neutral-400 ${
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

        {/* Password Field */}
        <div className="anim-element">
          <PasswordInput
            {...register('password')}
            disabled={isRateLimited}
            error={errors.password?.message}
          />
        </div>

        {/* Submit Button */}
        <div className="anim-element pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isRateLimited}
            aria-disabled={isSubmitting || isRateLimited}
            className="w-full relative flex items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#D0181C] active:bg-[#B51215] focus:outline-hidden focus:ring-2 focus:ring-brand-red/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : isRateLimited && secondsRemaining > 0 ? (
              <>
                <Clock className="h-4 w-4 animate-pulse" aria-hidden="true" />
                <span>Try again in {formattedCountdown}</span>
              </>
            ) : isRateLimited ? (
              <span>Too many attempts. Please try again later.</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
