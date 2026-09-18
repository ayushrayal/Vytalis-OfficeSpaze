import React from 'react';
import { ShieldCheck, CheckSquare, Square, Check, X, Lock } from 'lucide-react';
import { MODULE_DEFINITIONS, ACTIONS, ADMIN_ONLY_MODULES } from '../constants/users.constant';

const PermissionMatrixEditor = ({
  permissions = [],
  onChange,
  role = 'GM',
  disabled = false
}) => {
  // If role is ADMIN, display Full Access banner and do not render editable matrix
  if (role === 'ADMIN') {
    return (
      <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/80 space-y-2">
        <div className="flex items-center gap-2 text-brand-red font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-[#ED1F23]" />
          <span>FULL ACCESS</span>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Administrators possess complete, unrestricted system privileges across all modules, routes, and data. Custom granular permissions are not required or editable for this role.
        </p>
      </div>
    );
  }

  // Filter assignable modules (excluding ADMIN_ONLY_MODULES like user_management)
  const assignableModules = MODULE_DEFINITIONS.filter(
    (mod) => !ADMIN_ONLY_MODULES.includes(mod.key)
  );

  // Helper map: { [moduleKey]: Set of actions } (ignoring any stale admin-only entries)
  const permMap = new Map();
  permissions.forEach((p) => {
    if (p && p.module && !ADMIN_ONLY_MODULES.includes(p.module)) {
      permMap.set(p.module, new Set(p.actions || []));
    }
  });

  const isActionChecked = (moduleKey, actionKey) => {
    return permMap.get(moduleKey)?.has(actionKey) || false;
  };

  const isModuleAllChecked = (moduleKey) => {
    const actSet = permMap.get(moduleKey);
    if (!actSet) return false;
    return ACTIONS.every((act) => actSet.has(act.key));
  };

  const isModulePartiallyChecked = (moduleKey) => {
    const actSet = permMap.get(moduleKey);
    if (!actSet || actSet.size === 0) return false;
    return !ACTIONS.every((act) => actSet.has(act.key));
  };

  // Convert map back to array [{ module, actions }] (strictly excluding ADMIN_ONLY_MODULES)
  const commitMap = (updatedMap) => {
    const result = [];
    assignableModules.forEach((mod) => {
      const actSet = updatedMap.get(mod.key);
      if (actSet && actSet.size > 0) {
        result.push({
          module: mod.key,
          actions: Array.from(actSet)
        });
      }
    });
    onChange?.(result);
  };

  const handleToggleAction = (moduleKey, actionKey) => {
    if (disabled || ADMIN_ONLY_MODULES.includes(moduleKey)) return;
    const newMap = new Map(permMap);
    let actSet = newMap.get(moduleKey);
    if (!actSet) {
      actSet = new Set();
      newMap.set(moduleKey, actSet);
    } else {
      actSet = new Set(actSet);
      newMap.set(moduleKey, actSet);
    }

    if (actSet.has(actionKey)) {
      actSet.delete(actionKey);
      if (actSet.size === 0) {
        newMap.delete(moduleKey);
      }
    } else {
      actSet.add(actionKey);
    }

    commitMap(newMap);
  };

  const handleToggleModuleAll = (moduleKey) => {
    if (disabled || ADMIN_ONLY_MODULES.includes(moduleKey)) return;
    const newMap = new Map(permMap);
    const allChecked = isModuleAllChecked(moduleKey);

    if (allChecked) {
      // Uncheck all actions for this module
      newMap.delete(moduleKey);
    } else {
      // Check all actions for this module
      newMap.set(moduleKey, new Set(ACTIONS.map((a) => a.key)));
    }

    commitMap(newMap);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const newMap = new Map();
    assignableModules.forEach((mod) => {
      newMap.set(mod.key, new Set(ACTIONS.map((a) => a.key)));
    });
    commitMap(newMap);
  };

  const handleClearAll = () => {
    if (disabled) return;
    commitMap(new Map());
  };

  // Count active modules & total actions (only among assignable modules)
  let totalSelectedActions = 0;
  let activeModuleCount = 0;
  permMap.forEach((actSet, modKey) => {
    if (!ADMIN_ONLY_MODULES.includes(modKey) && actSet.size > 0) {
      activeModuleCount += 1;
      totalSelectedActions += actSet.size;
    }
  });

  return (
    <div className="space-y-3 font-urbanist">
      {/* Top Header / Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
        <div className="text-xs">
          <span className="font-bold text-neutral-900">{activeModuleCount}</span> of {assignableModules.length} modules enabled
          <span className="text-neutral-400 mx-1.5">•</span>
          <span className="font-bold text-[#ED1F23]">{totalSelectedActions}</span> total actions granted
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select All</span>
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <X className="w-3.5 h-3.5 text-red-600" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Permission Grid / List */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100 bg-white shadow-2xs max-h-[420px] overflow-y-auto">
        {MODULE_DEFINITIONS.map((mod) => {
          const isAdminOnly = ADMIN_ONLY_MODULES.includes(mod.key);

          if (isAdminOnly) {
            return (
              <div
                key={mod.key}
                className="p-3 bg-neutral-50/70 border-l-2 border-l-neutral-300 opacity-80 select-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 w-4 h-4 flex items-center justify-center text-neutral-400 shrink-0">
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-neutral-700 leading-tight">
                          {mod.label}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
                          <ShieldCheck className="w-3 h-3 text-neutral-500" />
                          Admin Only
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate max-w-xs sm:max-w-md mt-0.5">
                        User Management is restricted exclusively to Administrators and cannot be assigned to staff roles.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center pl-6 sm:pl-0">
                    <span className="text-[11px] font-semibold text-neutral-400 italic">
                      Locked to Admin role
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          const allChecked = isModuleAllChecked(mod.key);
          const partialChecked = isModulePartiallyChecked(mod.key);
          const actSet = permMap.get(mod.key) || new Set();

          return (
            <div
              key={mod.key}
              className={`p-3 transition-colors ${
                actSet.size > 0 ? 'bg-neutral-50/50' : 'hover:bg-neutral-50/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Module title & description + toggle all */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleModuleAll(mod.key)}
                    disabled={disabled}
                    className="mt-0.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    title={allChecked ? 'Deselect all module actions' : 'Select all module actions'}
                  >
                    {allChecked ? (
                      <CheckSquare className="w-4 h-4 text-[#ED1F23]" />
                    ) : partialChecked ? (
                      <div className="w-4 h-4 rounded border-2 border-[#ED1F23] flex items-center justify-center bg-[#ED1F23]/10">
                        <div className="w-2 h-0.5 bg-[#ED1F23] rounded-full" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4 text-neutral-300 hover:text-neutral-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 leading-tight">
                      {mod.label}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate max-w-xs sm:max-w-md">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Action Pills / Checkboxes */}
                <div className="flex items-center gap-1.5 pl-6 sm:pl-0 flex-wrap">
                  {ACTIONS.map((act) => {
                    const checked = isActionChecked(mod.key, act.key);

                    return (
                      <button
                        key={act.key}
                        type="button"
                        onClick={() => handleToggleAction(mod.key, act.key)}
                        disabled={disabled}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none border ${
                          checked
                            ? 'bg-[#ED1F23]/10 border-[#ED1F23]/30 text-[#ED1F23] shadow-2xs font-bold'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                            checked ? 'bg-[#ED1F23] text-white' : 'border border-neutral-300 bg-white'
                          }`}
                        >
                          {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionMatrixEditor;
