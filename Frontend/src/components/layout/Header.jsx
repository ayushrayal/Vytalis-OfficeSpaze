import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight } from 'lucide-react';
import UserMenu from './UserMenu';
import { getPageTitleByPath } from '../../constants/navigation';

const Header = ({ onMobileMenuOpen }) => {
  const location = useLocation();
  const pageTitle = getPageTitleByPath(location.pathname);

  return (
    <header className="h-16 bg-white border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg bg-warm-bg text-black hover:bg-neutral-200 focus:outline-hidden transition-all cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb / Page Title */}
        <div className="flex items-center gap-1.5 text-xs min-w-0">
          <span className="font-semibold text-muted-text hidden sm:inline shrink-0">Application</span>
          <ChevronRight className="w-3.5 h-3.5 text-light-gray hidden sm:inline shrink-0" />
          <h1 className="font-extrabold text-base sm:text-lg text-black tracking-tight truncate">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center gap-3">
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
