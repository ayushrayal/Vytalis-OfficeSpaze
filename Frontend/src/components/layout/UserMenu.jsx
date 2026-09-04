import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, ShieldCheck, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { ROUTES } from '../../routes/routeConfig';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-black/5 focus:outline-hidden transition-all cursor-pointer"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
          {getInitials(user?.name)}
        </div>
        <div className="hidden sm:block text-left">
          <span className="block text-xs font-bold text-black leading-tight">
            {user?.name || 'Administrator'}
          </span>
          <span className="block text-[10px] font-semibold text-muted-text">
            {user?.email || 'admin@officespaze.com'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-text transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-border shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-bold text-black">{user?.name || 'Admin Account'}</p>
            <p className="text-[11px] text-muted-text truncate">{user?.email || 'admin@officespaze.com'}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-soft-red text-brand-red text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              <span>{user?.role || 'System Admin'}</span>
            </div>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-red rounded-lg hover:bg-soft-red transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
