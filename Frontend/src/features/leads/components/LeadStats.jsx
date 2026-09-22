import React from 'react';
import {
  Megaphone,
  Calendar,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { LEAD_STATUS_CONFIG } from '../constants/leads.constant';

const LeadStats = ({
  stats = null,
  isLoading = false
}) => {
  const total = stats?.total ?? 0;
  const todayCount = stats?.today ?? 0;
  const upcomingCount = stats?.upcoming ?? 0;
  const overdueCount = stats?.overdue ?? 0;
  const noFollowUpCount = stats?.noFollowUp ?? 0;

  const cards = [
    {
      title: 'Total Leads',
      value: total,
      subtext: 'Scoped leads count',
      icon: Megaphone,
      accentClass: 'text-neutral-900 bg-neutral-100',
      borderHover: 'hover:border-neutral-300'
    },
    {
      title: "Today's Follow-ups",
      value: todayCount,
      subtext: 'Scheduled for today',
      icon: Calendar,
      accentClass: 'text-amber-700 bg-amber-50',
      borderHover: 'hover:border-amber-300'
    },
    {
      title: 'Upcoming',
      value: upcomingCount,
      subtext: 'Future scheduled follow-ups',
      icon: Clock,
      accentClass: 'text-blue-700 bg-blue-50',
      borderHover: 'hover:border-blue-300'
    },
    {
      title: 'Overdue',
      value: overdueCount,
      subtext: 'Requires immediate attention',
      icon: AlertTriangle,
      accentClass: 'text-rose-700 bg-rose-50',
      borderHover: 'hover:border-rose-300'
    }
  ];

  const statusItems = [
    { key: 'NEW', label: 'New', count: stats?.NEW ?? 0 },
    { key: 'CONTACTED', label: 'Contacted', count: stats?.CONTACTED ?? 0 },
    { key: 'FOLLOW_UP', label: 'Follow Up', count: stats?.FOLLOW_UP ?? 0 },
    { key: 'QUALIFIED', label: 'Qualified', count: stats?.QUALIFIED ?? 0 },
    { key: 'CONVERTED', label: 'Converted', count: stats?.CONVERTED ?? 0 },
    { key: 'LOST', label: 'Lost', count: stats?.LOST ?? 0 }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 mb-6 font-urbanist">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs animate-pulse"
            >
              <div className="h-4 bg-neutral-200 rounded-md w-24 mb-3"></div>
              <div className="h-7 bg-neutral-200 rounded-md w-16 mb-2"></div>
              <div className="h-3 bg-neutral-100 rounded-md w-32"></div>
            </div>
          ))}
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs animate-pulse h-14"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6 font-urbanist">
      {/* ─── 1. TOP METRIC CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs transition-all ${card.borderHover}`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.accentClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-neutral-900 tracking-tight text-2xl sm:text-3xl">
                  {card.value.toLocaleString()}
                </h3>
                <p className="text-xs font-medium text-neutral-400 truncate">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 2. STATUS PIPELINE BAR ─────────────────────────────────────── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[11px] mr-1">
            Status Breakdown:
          </span>
          {statusItems.map((item) => {
            const cfg = LEAD_STATUS_CONFIG[item.key] || {};
            return (
              <div
                key={item.key}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badgeClass || 'bg-neutral-50 text-neutral-700 border-neutral-200'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass || 'bg-neutral-400'}`}></span>
                <span>{item.label}:</span>
                <span className="font-bold">{item.count}</span>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-semibold bg-neutral-50 px-2.5 py-1 rounded-full border border-neutral-200">
          <FileText className="w-3 h-3 text-neutral-400" />
          <span>No Follow-up: <strong className="text-neutral-800">{noFollowUpCount}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default LeadStats;
