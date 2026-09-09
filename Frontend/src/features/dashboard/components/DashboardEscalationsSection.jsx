import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Settings2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ROUTES } from '../../../routes/routeConfig';
import { useAttentionEscalations } from '../../escalations/hooks/useAttentionEscalations';
import { useEscalationSettings } from '../../escalations/hooks/useEscalationSettings';
import { useResolveEscalation } from '../../escalations/hooks/useResolveEscalation';
import useEscalationCountdown from '../../escalations/hooks/useEscalationCountdown';
import {
  formatRemainingTime,
  getEscalationUrgency,
  getPriorityBadge
} from '../../escalations/utils/escalations.utils';

import ResolveEscalationModal from '../../escalations/components/ResolveEscalationModal';
import ConfigureAlertWindowModal from '../../escalations/components/ConfigureAlertWindowModal';

const DashboardEscalationsSection = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useAttentionEscalations();
  const {
    alertWindowHours,
    updateAlertWindow,
    isUpdating: isUpdatingSettings
  } = useEscalationSettings();

  const resolveMutation = useResolveEscalation();
  const now = useEscalationCountdown(5000);

  const rawEscalations = data?.escalations || [];

  // Interaction states
  const [resolvingEscalation, setResolvingEscalation] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Client-side live filter adhering to the core business rule:
  // Show only escalations that are NOT resolved AND (remaining <= alertWindowHours OR OVERDUE)
  const attentionEscalations = useMemo(() => {
    const currentTime = now.getTime();
    const alertWindowMs = alertWindowHours * 3600000;

    return rawEscalations
      .filter((esc) => {
        if (esc.resolvedAt) return false;
        const dueTime = new Date(esc.resolveDueAt).getTime();
        const isOverdue = currentTime >= dueTime;
        const isWithinWindow = dueTime - currentTime <= alertWindowMs;
        return isOverdue || isWithinWindow;
      })
      .sort((a, b) => {
        const aDue = new Date(a.resolveDueAt).getTime();
        const bDue = new Date(b.resolveDueAt).getTime();
        const aOverdue = currentTime >= aDue;
        const bOverdue = currentTime >= bDue;

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        return aDue - bDue;
      });
  }, [rawEscalations, alertWindowHours, now]);

  const handleResolveConfirm = async (id) => {
    try {
      await resolveMutation.mutateAsync(id);
      setResolvingEscalation(null);
    } catch {
      // Toast handled by mutation
    }
  };

  const handleSaveSettings = async (newHours) => {
    try {
      await updateAlertWindow(newHours);
      setIsSettingsOpen(false);
    } catch {
      // Toast handled by mutation
    }
  };

  const handleSeeDetails = (esc) => {
    const id = esc.id || esc._id;
    navigate(`${ROUTES.ESCALATIONS || '/escalations'}?open=${id}`);
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-3.5 font-urbanist">
      {/* 1. Header: Primary Control & Threshold Hierarchy */}
      <div className="pb-3 border-b border-neutral-100 space-y-3">
        {/* Row 1: Section Title + Primary Admin Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                OPERATIONAL ATTENTION
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  attentionEscalations.length > 0
                    ? 'bg-soft-red text-brand-red border border-brand-red/20'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {attentionEscalations.length}{' '}
                {attentionEscalations.length === 1 ? 'escalation' : 'escalations'} requiring attention
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight my-0 mt-0.5">
              Escalations Requiring Attention
            </h2>
          </div>

          {/* PRIMARY CONTROL: Configure Dashboard Alert Window */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-bold text-neutral-900 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 border border-neutral-300 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0 self-start sm:self-auto w-full sm:w-auto"
            title="Configure Dashboard Alert Window threshold"
          >
            <Settings2 className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
            <span>Configure Dashboard Alert Window</span>
          </button>
        </div>

        {/* Row 2: Secondary Bar - Context Notice + Active Threshold Badge + View All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap text-neutral-500 text-[11px]">
            <span>Controlled by admin-defined alert threshold:</span>
            <span className="inline-flex items-center font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/80">
              Alert Window: {alertWindowHours}h
            </span>
          </div>

          <NavLink
            to={ROUTES.ESCALATIONS || '/escalations'}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-red hover:text-brand-red/80 hover:underline transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </NavLink>
        </div>
      </div>

      {/* 2. Content: Compact Cards or Intentional All Clear */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-neutral-100 rounded-xl border border-neutral-200" />
          ))}
        </div>
      ) : attentionEscalations.length === 0 ? (
        <div className="py-5 px-4 text-center bg-warm-bg/25 rounded-xl border border-dashed border-border/80 flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All clear</span>
          </div>
          <p className="text-[11px] text-muted-text my-0">
            No escalations currently require immediate attention within the {alertWindowHours}h alert window.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {attentionEscalations.map((esc) => {
            const id = esc.id || esc._id;
            const urgency = getEscalationUrgency(esc.resolveDueAt, esc.resolvedAt, now);
            const priorityBadge = getPriorityBadge(esc.priority);
            const remainingTimeStr = formatRemainingTime(esc.resolveDueAt, esc.resolvedAt, now);

            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => handleSeeDetails(esc)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSeeDetails(esc);
                  }
                }}
                className={`p-3.5 sm:p-4 bg-white rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-2.5 group focus:outline-hidden ${urgency.cardBorder}`}
              >
                <div>
                  {/* Top Bar: Escalation Type + Priority Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate my-0 group-hover:text-brand-red transition-colors">
                      {esc.escalationType}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${priorityBadge.badgeClass}`}>
                      {priorityBadge.shortLabel || esc.priority}
                    </span>
                  </div>

                  {/* Description: Clean line clamp */}
                  <p
                    className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mt-1.5 my-0 font-normal"
                    title={esc.description}
                  >
                    {esc.description}
                  </p>
                </div>

                {/* Bottom Section: Reporter + Prominent Time + See details */}
                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-[11px] text-neutral-500 truncate">
                      Escalated by: <strong className="font-medium text-neutral-800">{esc.escalatedBy}</strong>
                    </span>

                    {/* Time Remaining Prominence */}
                    <span className={`font-bold text-xs shrink-0 ${urgency.textClass}`}>
                      {remainingTimeStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResolvingEscalation(esc);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Resolve</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeeDetails(esc);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 group-hover:text-brand-red transition-colors cursor-pointer bg-transparent border-0 p-0"
                    >
                      <span>See details</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Resolve Confirmation */}
      <ResolveEscalationModal
        isOpen={Boolean(resolvingEscalation)}
        onClose={() => setResolvingEscalation(null)}
        onConfirm={handleResolveConfirm}
        isLoading={resolveMutation.isPending}
        escalation={resolvingEscalation}
      />

      {/* Modal for Alert Window Configuration */}
      <ConfigureAlertWindowModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentHours={alertWindowHours}
        onSave={handleSaveSettings}
        isLoading={isUpdatingSettings}
      />
    </div>
  );
};

export default DashboardEscalationsSection;
