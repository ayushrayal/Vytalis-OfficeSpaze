import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import { ROUTES } from '../../../routes/routeConfig';

const LoginPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If auth is still checking initial state, show a clean minimal spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Checking Session...
          </p>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-warm-bg px-4 py-8 md:py-12">
      {/* Top Brand Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-brand-red text-white flex items-center justify-center font-extrabold text-xl rounded-lg shadow-xs">
            V
          </div>
          <div>
            <span className="font-extrabold text-lg text-black tracking-tight block leading-none">
              VYTALIS
            </span>
            <span className="text-[10px] font-bold text-brand-red tracking-widest uppercase block mt-0.5">
              Office Spaze Intelligence
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-xs font-medium text-muted-text shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
          <span>Secure Enterprise Portal</span>
        </div>
      </header>

      {/* Main Login Content Card */}
      <main className="w-full max-w-md mx-auto my-8">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-black tracking-tight mb-2">
              Admin Authentication
            </h1>
            <p className="text-xs text-muted-text">
              Sign in to manage workspaces, bills, and intelligence data
            </p>
          </div>

          <LoginForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center">
        <p className="text-xs text-muted-text">
          &copy; {new Date().getFullYear()} Vytalis Office Spaze Intelligence. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
