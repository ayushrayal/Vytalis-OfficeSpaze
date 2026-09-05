import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/SignupForm';
import { ROUTES } from '../../../routes/routeConfig';

const SignupPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If auth is still checking initial session state, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-bg font-urbanist">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Checking Session...
          </p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-warm-bg px-4 py-8 md:py-12 font-urbanist overflow-y-auto">
      {/* Top Brand Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-red text-white flex items-center justify-center font-extrabold text-xl rounded-lg shadow-xs shrink-0">
            O
          </div>
          <div>
            <span className="font-extrabold text-base text-black tracking-tight block leading-tight">
              Office Spaze
            </span>
            <span className="text-[10px] font-medium text-muted-text block mt-0.5">
              by Vytalis Media
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-xs font-medium text-muted-text shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
          <span>Admin Registration</span>
        </div>
      </header>

      {/* Main Signup Content Card */}
      <main className="w-full max-w-md mx-auto my-6 sm:my-8">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-black tracking-tight mb-2">
              Create Admin Account
            </h1>
            <p className="text-xs text-muted-text">
              Create your account to manage Office Spaze operations.
            </p>
          </div>

          <SignupForm />

          {/* Login Navigation Link */}
          <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-600">
              Already have an account?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-bold text-brand-red hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center pb-4">
        <p className="text-xs text-muted-text">
          &copy; {new Date().getFullYear()} Office Spaze by Vytalis Media. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SignupPage;
