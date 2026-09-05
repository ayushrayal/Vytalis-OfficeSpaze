import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

const DetailsDrawer = ({
  isOpen,
  onClose,
  title = 'Record Details',
  subtitle,
  badge,
  icon: Icon,
  children,
  footerActions
}) => {
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

  // Lock body scroll and set up listeners
  useEffect(() => {
    if (!isOpen) return;

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Keydown Escape handler
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // GSAP entrance animation
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (drawerRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        drawerRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.35, ease: 'power3.out' }
      );
    }

    if (backdropRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden font-urbanist"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div
          ref={drawerRef}
          onClick={(e) => e.stopPropagation()}
          className="w-screen max-w-full sm:max-w-xl md:w-[540px] bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-200/80 z-10"
        >
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white z-10 px-4 sm:px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {Icon && (
                <div className="p-2.5 rounded-xl bg-[#ED1F23]/10 text-[#ED1F23] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {title}
                  </span>
                  {badge}
                </div>
                {subtitle && (
                  <h3
                    id="drawer-title"
                    className="text-base sm:text-lg font-extrabold text-neutral-900 truncate font-urbanist mt-0.5"
                  >
                    {subtitle}
                  </h3>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {children}
          </div>

          {/* Sticky Footer */}
          {footerActions && (
            <div className="sticky bottom-0 bg-neutral-50/95 backdrop-blur-xs z-10 px-4 sm:px-6 py-3.5 border-t border-neutral-200/80 flex items-center justify-between gap-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsDrawer;
