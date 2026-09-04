import React from 'react';
import { LayoutDashboard, CheckCircle2, Shield, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soft-red text-brand-red text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>App Shell Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
            Welcome back, {user?.name || 'Administrator'}!
          </h2>
          <p className="text-xs sm:text-sm text-muted-text max-w-xl">
            Vytalis Office Spaze Intelligence dashboard shell and module navigation structure are active.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-warm-bg border border-border/80 text-xs">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div>
            <span className="font-bold text-black block">{user?.name || 'Admin'}</span>
            <span className="text-muted-text block text-[11px]">{user?.email || 'admin@officespaze.com'}</span>
          </div>
        </div>
      </div>

      {/* Verification Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-black">Desktop Sidebar</h3>
          <p className="text-xs text-muted-text leading-relaxed">
            Fixed 260px sidebar with section groupings, brand header, active link indicators, and collapse capability.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-red text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-black">Mobile Off-Canvas Drawer</h3>
          <p className="text-xs text-muted-text leading-relaxed">
            Off-canvas drawer navigation for mobile/tablet viewports with GSAP animations and backdrop dismissal.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-black">Top Header & User Menu</h3>
          <p className="text-xs text-muted-text leading-relaxed">
            Sticky header displaying dynamic breadcrumbs, user initials badge, session details, and sign out handler.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
