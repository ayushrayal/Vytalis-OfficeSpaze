import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NAVIGATION_SECTIONS } from '../../constants/navigation';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  return (
    <aside
      className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-0 bg-black border-r border-neutral-800 text-white z-40 transition-all duration-300 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 bg-brand-red text-white flex items-center justify-center font-extrabold text-xl rounded-lg shrink-0 shadow-xs">
            V
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-extrabold text-base text-white tracking-tight block leading-none">
                VYTALIS
              </span>
              <span className="text-[9px] font-bold text-brand-red tracking-widest uppercase block mt-0.5">
                Office Spaze
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 focus:outline-hidden transition-all cursor-pointer shrink-0"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
        {NAVIGATION_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1.5">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {section.title}
              </p>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-red text-white shadow-xs font-bold'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between shrink-0">
          <span>System Status</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            V1 Active
          </span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
