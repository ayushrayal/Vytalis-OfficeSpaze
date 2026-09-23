import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService } from '../services/lead.service';
import { followUpService } from '../services/followUp.service';
import { toast } from 'sonner';

export const LEADS_QUERY_KEY = ['leads'];
export const LEAD_SYNC_STATUS_KEY = ['leadSyncStatus'];
export const FOLLOW_UPS_QUERY_KEY = ['followUps'];
export const FOLLOW_UP_METRICS_QUERY_KEY = ['followUpMetrics'];

/**
 * Hook to fetch paginated leads with search and filter parameters.
 * @param {{ page?: number, limit?: number, search?: string, status?: string, assignedTo?: string, dateFrom?: string, dateTo?: string }} params
 */
export const useLeads = (params = {}) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadService.getLeads(params),
    placeholderData: (previousData) => previousData
  });
};

/**
 * Hook to fetch a single lead's full details.
 * @param {string} id
 */
export const useLead = (id) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadService.getLeadById(id),
    enabled: Boolean(id)
  });
};

/**
 * Hook to fetch Windsor lead synchronization status and totals.
 */
export const useLeadSyncStatus = () => {
  return useQuery({
    queryKey: LEAD_SYNC_STATUS_KEY,
    queryFn: () => leadService.getSyncStatus(),
    staleTime: 60 * 1000
  });
};

/**
 * Hook for Admin to trigger live Windsor sync into MongoDB.
 */
export const useSyncLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => leadService.syncLeads(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEAD_SYNC_STATUS_KEY });

      const d = res?.data || {};
      toast.success(
        `Meta leads synced: ${d.created ?? 0} created, ${d.updated ?? 0} updated, ${d.skipped ?? 0} skipped.`
      );
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to sync Meta leads';
      toast.error(message);
    }
  });
};

export const LEAD_ASSIGNEES_QUERY_KEY = ['leadAssignees'];

/**
 * Hook to fetch assignable users (GM, TEAM_MANAGER, INTERN).
 */
export const useAssignableUsers = (options = {}) => {
  return useQuery({
    queryKey: LEAD_ASSIGNEES_QUERY_KEY,
    queryFn: () => leadService.getAssignees(),
    staleTime: 5 * 60 * 1000,
    ...options
  });
};

/**
 * Hook to assign or unassign a lead.
 */
export const useAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedTo }) => leadService.assignLead(id, assignedTo),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      toast.success(res?.message || 'Lead assignment updated');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update lead assignment';
      toast.error(message);
    }
  });
};

/**
 * Hook to update lead status.
 */
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => leadService.updateLeadStatus(id, status),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      toast.success(res?.message || 'Lead status updated');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update lead status';
      toast.error(message);
    }
  });
};

/**
 * Hook to update lead notes.
 */
export const useUpdateLeadNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }) => leadService.updateLeadNotes(id, notes),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', variables.id] });
      toast.success(res?.message || 'Lead notes updated');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update lead notes';
      toast.error(message);
    }
  });
};

export const LEAD_STATS_QUERY_KEY = ['leadStats'];

/**
 * Hook to fetch aggregated lead statistics scoped to authenticated user.
 */
export const useLeadStats = () => {
  return useQuery({
    queryKey: LEAD_STATS_QUERY_KEY,
    queryFn: () => leadService.getLeadStats(),
    staleTime: 30 * 1000
  });
};

/**
 * Hook to update or clear follow-up schedule on a lead.
 */
export const useUpdateLeadFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, nextFollowUpAt }) => leadService.updateLeadFollowUp(id, nextFollowUpAt),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', variables.id] });
      toast.success(res?.message || 'Lead follow-up updated');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update follow-up';
      toast.error(message);
    }
  });
};

/**
 * Hook to fetch paginated lead activity history.
 * @param {string} id
 * @param {number} [page=1]
 */
export const useLeadActivity = (id, page = 1) => {
  return useQuery({
    queryKey: ['leadActivity', id, page],
    queryFn: () => leadService.getLeadActivity(id, { page, limit: 10 }),
    enabled: Boolean(id),
    staleTime: 10 * 1000
  });
};

/**
 * Hook for Admin to bulk assign/unassign leads.
 */
export const useBulkAssignLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => leadService.bulkAssignLeads(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success(res?.message || 'Bulk assignment updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to bulk assign leads';
      toast.error(message);
    }
  });
};

/**
 * Hook to bulk update lead status.
 */
export const useBulkUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => leadService.bulkUpdateLeadStatus(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success(res?.message || 'Bulk status updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update status in bulk';
      toast.error(message);
    }
  });
};

/**
 * Hook to bulk archive active leads.
 */
export const useBulkArchiveLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => leadService.bulkArchiveLeads(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success(res?.message || 'Leads archived successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to archive leads';
      toast.error(message);
    }
  });
};

/**
 * Hook to bulk restore archived leads.
 */
export const useBulkRestoreLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => leadService.bulkRestoreLeads(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success(res?.message || 'Leads restored successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to restore leads';
      toast.error(message);
    }
  });
};

/**
 * Hook for Admin to bulk permanently delete archived leads.
 */
export const useBulkPermanentDeleteLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => leadService.bulkPermanentDeleteLeads(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success(res?.message || 'Leads permanently deleted');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to permanently delete leads';
      toast.error(message);
    }
  });
};

/**
 * Hook to retrieve conversion target records with caching.
 */
export const useConversionTargets = (type, search = '', enabled = true) => {
  return useQuery({
    queryKey: ['conversionTargets', type, search],
    queryFn: () => leadService.getConversionTargets({ type, search }),
    enabled: Boolean(enabled && type),
    staleTime: 60 * 1000
  });
};

/**
 * Hook to convert a lead to an official business outcome.
 */
export const useConvertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => leadService.convertLead(id, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', variables.id] });
      toast.success(res?.message || 'Lead converted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to convert lead';
      toast.error(message);
    }
  });
};

/**
 * Hook to retrieve follow-up history for a single lead.
 */
export const useLeadFollowUps = (leadId, params = {}) => {
  return useQuery({
    queryKey: ['leadFollowUps', leadId, params],
    queryFn: () => followUpService.getLeadFollowUps(leadId, params),
    enabled: Boolean(leadId)
  });
};

/**
 * Hook to retrieve global or scoped follow-ups for dedicated Follow-ups page and widget.
 */
export const useFollowUpsList = (params = {}) => {
  return useQuery({
    queryKey: [FOLLOW_UPS_QUERY_KEY[0], params],
    queryFn: () => followUpService.getFollowUpsList(params),
    placeholderData: (previousData) => previousData
  });
};

/**
 * Hook to retrieve follow-up aggregate metrics.
 */
export const useFollowUpMetrics = () => {
  return useQuery({
    queryKey: FOLLOW_UP_METRICS_QUERY_KEY,
    queryFn: () => followUpService.getFollowUpMetrics(),
    staleTime: 30 * 1000
  });
};

/**
 * Hook to schedule a new follow-up for a lead.
 */
export const useScheduleFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, ...data }) => followUpService.scheduleFollowUp(leadId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leadFollowUps', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UP_METRICS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success('Follow-up scheduled successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to schedule follow-up';
      toast.error(message);
    }
  });
};

/**
 * Hook to reschedule an active pending follow-up.
 */
export const useRescheduleFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, followUpId, ...data }) =>
      followUpService.rescheduleFollowUp(leadId, followUpId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leadFollowUps', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UP_METRICS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success('Follow-up rescheduled successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to reschedule follow-up';
      toast.error(message);
    }
  });
};

/**
 * Hook to mark an active pending follow-up as COMPLETED.
 */
export const useCompleteFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, followUpId }) =>
      followUpService.completeFollowUp(leadId, followUpId),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leadFollowUps', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UP_METRICS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success('Follow-up marked as completed');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to complete follow-up';
      toast.error(message);
    }
  });
};

/**
 * Hook to cancel an active pending follow-up.
 */
export const useCancelFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, followUpId }) =>
      followUpService.cancelFollowUp(leadId, followUpId),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leadFollowUps', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UP_METRICS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success('Follow-up cancelled');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to cancel follow-up';
      toast.error(message);
    }
  });
};

/**
 * Hook for admin to trigger batch missed follow-up processing.
 */
export const useProcessMissedFollowUps = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => followUpService.processMissedFollowUps(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOW_UP_METRICS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEAD_STATS_QUERY_KEY });
      toast.success(`Processed missed follow-ups (${res?.data?.processedCount ?? 0} updated)`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to process missed follow-ups';
      toast.error(message);
    }
  });
};
