import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  updateWalkinStatus,
  getWalkinFollowUps,
  scheduleWalkinFollowUp,
  rescheduleWalkinFollowUp,
  completeWalkinFollowUp,
  cancelWalkinFollowUp,
  getWalkinActivity,
  addWalkinNote
} from '../services/walkin.service';
import { WALKINS_QUERY_KEY, WALKIN_GLOBAL_FOLLOWUPS_QUERY_KEY } from './useWalkins';
import { WALKIN_DETAIL_QUERY_KEY } from './useWalkin';

export const WALKIN_FOLLOWUPS_QUERY_KEY = 'walkin-followups';
export const WALKIN_ACTIVITY_QUERY_KEY = 'walkin-activity';

/**
 * Hook to fetch follow-ups for a walk-in
 */
export const useWalkinFollowUps = (walkinId) => {
  return useQuery({
    queryKey: [WALKIN_FOLLOWUPS_QUERY_KEY, walkinId],
    queryFn: () => getWalkinFollowUps(walkinId),
    enabled: Boolean(walkinId)
  });
};

/**
 * Hook to fetch activity timeline for a walk-in
 */
export const useWalkinActivity = (walkinId, { page = 1, limit = 20 } = {}) => {
  return useQuery({
    queryKey: [WALKIN_ACTIVITY_QUERY_KEY, walkinId, page, limit],
    queryFn: () => getWalkinActivity(walkinId, { page, limit }),
    enabled: Boolean(walkinId)
  });
};

/**
 * Hook to update walk-in status with optional note
 */
export const useUpdateWalkinStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, note }) => updateWalkinStatus(id, { status, note }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: WALKINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALKIN_GLOBAL_FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [WALKIN_DETAIL_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WALKIN_ACTIVITY_QUERY_KEY, id] });
      toast.success('Walk-in status updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
    }
  });
};

/**
 * Hook to schedule a new follow-up
 */
export const useScheduleWalkinFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dueAt, note }) => scheduleWalkinFollowUp(id, { dueAt, note }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: WALKINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALKIN_GLOBAL_FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [WALKIN_DETAIL_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WALKIN_FOLLOWUPS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WALKIN_ACTIVITY_QUERY_KEY, id] });
      toast.success('Follow-up scheduled successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to schedule follow-up';
      toast.error(message);
    }
  });
};

/**
 * Hook to reschedule an active follow-up
 */
export const useRescheduleWalkinFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, followUpId, dueAt, note }) =>
      rescheduleWalkinFollowUp(id, followUpId, { dueAt, note }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: WALKINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALKIN_GLOBAL_FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [WALKIN_DETAIL_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WALKIN_FOLLOWUPS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WALKIN_ACTIVITY_QUERY_KEY, id] });
      toast.success('Follow-up rescheduled successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to reschedule follow-up';
      toast.error(message);
    }
  });
};

/**
 * Hook to complete an active follow-up
 */
export const useCompleteWalkinFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, followUpId, note }) =>
      completeWalkinFollowUp(id, followUpId, { note }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: WALKINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALKIN_GLOBAL_FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [WALKIN_DETAIL_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WALKIN_FOLLOWUPS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WALKIN_ACTIVITY_QUERY_KEY, id] });
      toast.success('Follow-up marked as completed');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to complete follow-up';
      toast.error(message);
    }
  });
};

/**
 * Hook to cancel an active follow-up
 */
export const useCancelWalkinFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, followUpId, note }) =>
      cancelWalkinFollowUp(id, followUpId, { note }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: WALKINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALKIN_GLOBAL_FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [WALKIN_DETAIL_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WALKIN_FOLLOWUPS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [WALKIN_ACTIVITY_QUERY_KEY, id] });
      toast.success('Follow-up cancelled');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to cancel follow-up';
      toast.error(message);
    }
  });
};


/**
 * Hook to add a standalone CRM note
 */
export const useAddWalkinNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }) => addWalkinNote(id, { note }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [WALKIN_ACTIVITY_QUERY_KEY, id] });
      toast.success('Note added to activity timeline');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to add note';
      toast.error(message);
    }
  });
};
