import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService } from '../services/lead.service';
import { toast } from 'sonner';

export const LEADS_QUERY_KEY = ['leads'];
export const LEAD_SYNC_STATUS_KEY = ['leadSyncStatus'];

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
