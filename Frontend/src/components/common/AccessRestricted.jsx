import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../routes/routeConfig';

const AccessRestricted = () => {
  const navigate = useNavigate();
  const { can, isAdmin } = usePermissions();

  const hasDashboardAccess = isAdmin || can('dashboard', 'view');

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(hasDashboardAccess ? ROUTES.DASHBOARD : ROUTES.LOGIN);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-red border border-red-100 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-black tracking-tight">
            Access Restricted
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
            You don't have permission to access this page. Please contact your system administrator if you require access to this module.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasDashboardAccess ? (
            <>
              <button
                type="button"
                onClick={() => navigate(ROUTES.DASHBOARD)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold shadow-xs hover:bg-[#D0181C] transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>

              <button
                type="button"
                onClick={handleGoBack}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 hover:text-black hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold shadow-xs hover:bg-[#D0181C] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessRestricted;
