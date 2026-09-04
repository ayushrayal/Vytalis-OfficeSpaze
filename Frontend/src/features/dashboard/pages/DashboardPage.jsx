import React from 'react';
import { LogOut, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { ROUTES } from '../../../routes/routeConfig';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="bg-white p-6 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-black">Vytalis Office Spaze</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-soft-red text-brand-red uppercase">
                V1 Dashboard
              </span>
            </div>
            <p className="text-xs text-muted-text mt-1">
              Authentication Module Foundation Verified
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Auth Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-red" />
            <span>Current Authenticated User Session</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-warm-bg/50 border border-border/60">
              <span className="text-xs text-muted-text font-semibold block uppercase mb-1">Name</span>
              <span className="font-bold text-black flex items-center gap-2">
                <User className="w-4 h-4 text-muted-text" />
                {user?.name || 'Admin'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-warm-bg/50 border border-border/60">
              <span className="text-xs text-muted-text font-semibold block uppercase mb-1">Email</span>
              <span className="font-bold text-black">{user?.email || 'admin@officespaze.com'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
