import { useQuery } from '@tanstack/react-query';
import { leadAnalyticsService } from '../services/leadAnalytics.service';

export const LEAD_ANALYTICS_QUERY_KEY = ['leadAnalytics'];

/**
 * Hook to fetch CRM analytics overview (KPIs, status distribution, summaries).
 * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
 */
export const useLeadAnalyticsOverview = (params = {}) => {
  return useQuery({
    queryKey: [...LEAD_ANALYTICS_QUERY_KEY, 'overview', params],
    queryFn: () => leadAnalyticsService.getOverview(params),
    staleTime: 30 * 1000
  });
};

/**
 * Hook to fetch CRM analytics continuous daily trends.
 * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
 */
export const useLeadAnalyticsTrends = (params = {}) => {
  return useQuery({
    queryKey: [...LEAD_ANALYTICS_QUERY_KEY, 'trends', params],
    queryFn: () => leadAnalyticsService.getTrends(params),
    staleTime: 30 * 1000
  });
};

/**
 * Hook to fetch assignee leaderboard metrics. (ADMIN ONLY)
 * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
 * @param {{ enabled?: boolean }} options
 */
export const useLeadAssigneeAnalytics = (params = {}, { enabled = true } = {}) => {
  return useQuery({
    queryKey: [...LEAD_ANALYTICS_QUERY_KEY, 'assignees', params],
    queryFn: () => leadAnalyticsService.getAssignees(params),
    enabled: Boolean(enabled),
    staleTime: 30 * 1000
  });
};

/**
 * Hook to fetch detailed conversion analytics breakdown.
 * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
 */
export const useLeadConversionAnalytics = (params = {}) => {
  return useQuery({
    queryKey: [...LEAD_ANALYTICS_QUERY_KEY, 'conversions', params],
    queryFn: () => leadAnalyticsService.getConversions(params),
    staleTime: 30 * 1000
  });
};

/**
 * Hook to fetch authoritative follow-up analytics.
 * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
 */
export const useLeadFollowUpAnalytics = (params = {}) => {
  return useQuery({
    queryKey: [...LEAD_ANALYTICS_QUERY_KEY, 'followUps', params],
    queryFn: () => leadAnalyticsService.getFollowUps(params),
    staleTime: 30 * 1000
  });
};
