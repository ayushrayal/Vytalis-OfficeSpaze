import React, { useState } from 'react';
import { RefreshCw, BarChart3, AlertCircle } from 'lucide-react';
import usePermissions from '../../../hooks/usePermissions';
import {
  useLeadAnalyticsOverview,
  useLeadAnalyticsTrends,
  useLeadAssigneeAnalytics
} from '../hooks/useLeadAnalytics';
import AnalyticsDateRangeSelector from '../components/analytics/AnalyticsDateRangeSelector';
import AnalyticsKpiCards from '../components/analytics/AnalyticsKpiCards';
import LeadTrendChart from '../components/analytics/LeadTrendChart';
import LeadStatusDistributionChart from '../components/analytics/LeadStatusDistributionChart';
import ConversionTypeChart from '../components/analytics/ConversionTypeChart';
import AssigneePerformanceTable from '../components/analytics/AssigneePerformanceTable';
import FollowUpHealthCards from '../components/analytics/FollowUpHealthCards';

const LeadAnalyticsPage = () => {
  const { isAdmin } = usePermissions();

  const [preset, setPreset] = useState('last30days');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [includeArchived, setIncludeArchived] = useState(false);

  const queryParams = {
    preset,
    ...(preset === 'custom' ? customRange : {}),
    includeArchived: isAdmin ? includeArchived : false
  };

  const overviewQuery = useLeadAnalyticsOverview(queryParams);
  const trendsQuery = useLeadAnalyticsTrends(queryParams);
  const assigneeQuery = useLeadAssigneeAnalytics(queryParams, { enabled: isAdmin });

  const isLoading = overviewQuery.isLoading || trendsQuery.isLoading;
  const isError = overviewQuery.isError || trendsQuery.isError;
  const errorObj = overviewQuery.error || trendsQuery.error;

  const handleRefresh = () => {
    overviewQuery.refetch();
    trendsQuery.refetch();
    if (isAdmin) {
      assigneeQuery.refetch();
    }
  };

  const handlePresetChange = (newPreset) => {
    setPreset(newPreset);
  };

  const handleCustomRangeApply = (startDate, endDate) => {
    setCustomRange({ startDate, endDate });
    setPreset('custom');
  };

  const overviewData = overviewQuery.data?.data || {};
  const trendsData = trendsQuery.data?.data?.trends || [];
  const assigneeData = assigneeQuery.data?.data?.assignees || [];
  const rangeMeta = overviewQuery.data?.meta?.range || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-white rounded-xl shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black tracking-tight">
                CRM Analytics
              </h1>
              <p className="text-xs text-muted-text">
                Real-time operational lead performance, conversion outcomes, and assignee velocity.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-border rounded-xl text-xs font-semibold text-black hover:bg-neutral-50 transition-colors shadow-xs self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Date Range Selector */}
      <AnalyticsDateRangeSelector
        preset={preset}
        onPresetChange={handlePresetChange}
        startDate={customRange.startDate}
        endDate={customRange.endDate}
        onCustomRangeApply={handleCustomRangeApply}
        includeArchived={includeArchived}
        onToggleIncludeArchived={setIncludeArchived}
        isAdmin={isAdmin}
        rangeLabel={rangeMeta.rangeLabel}
      />

      {/* Error State with Retry */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-red-700 font-semibold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load CRM analytics</span>
          </div>
          <p className="text-xs text-red-600 max-w-md mx-auto">
            {errorObj?.response?.data?.message || errorObj?.message || 'A network or server error occurred.'}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-xs"
          >
            Retry Analytics
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <AnalyticsKpiCards
        kpis={overviewData.kpis}
        isLoading={isLoading}
      />

      {/* Trends & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadTrendChart
          trends={trendsData}
          isLoading={trendsQuery.isLoading}
        />
        <LeadStatusDistributionChart
          statusDistribution={overviewData.statusDistribution}
          isLoading={overviewQuery.isLoading}
        />
      </div>

      {/* Conversions by Type & Follow-up Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionTypeChart
          conversionSummary={overviewData.conversionSummary}
          isLoading={overviewQuery.isLoading}
        />
        <FollowUpHealthCards
          followUpSummary={overviewData.followUpSummary}
          isLoading={overviewQuery.isLoading}
        />
      </div>

      {/* Admin Assignee Performance Table */}
      {isAdmin && (
        <AssigneePerformanceTable
          assignees={assigneeData}
          isLoading={assigneeQuery.isLoading}
        />
      )}
    </div>
  );
};

export default LeadAnalyticsPage;
