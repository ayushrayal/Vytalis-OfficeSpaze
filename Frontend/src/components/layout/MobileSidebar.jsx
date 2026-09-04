import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { NAVIGATION_SECTIONS } from '../../constants/navigation';

const MobileSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useGSAP(
    () => {
      if (isOpen) {
        gsap.to(backdropRef.current, { opacity: 1, duration: 0.2, display: 'block' });
        gsap.to(drawerRef.current, { x: 0, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.to(drawerRef.current, { x: '-100%', duration: 0.25, ease: 'power2.in' });
        gsap.to(backdropRef.current, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            if (backdropRef.current) backdropRef.current.style.display = 'none';
          }
        });
      }
    },
    { dependencies: [isOpen] }
  );

  if (!isOpen && (!backdropRef.current || backdropRef.current.style.display === 'none')) {
    // Hidden initially before animation
  }

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        style={{ display: 'none', opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Off-canvas Drawer */}
      <aside
        ref={drawerRef}
        style={{ transform: 'translateX(-100%)' }}
        className="fixed top-0 bottom-0 left-0 w-72 bg-black border-r border-neutral-800 text-white z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-red text-white flex items-center justify-center font-extrabold text-xl rounded-lg shadow-xs">
              V
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block leading-none">
                VYTALIS
              </span>
              <span className="text-[9px] font-bold text-brand-red tracking-widest uppercase block mt-0.5">
                Office Spaze
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 focus:outline-hidden transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAVIGATION_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {section.title}
              </p>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-red text-white shadow-xs font-bold'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default MobileSidebar;
