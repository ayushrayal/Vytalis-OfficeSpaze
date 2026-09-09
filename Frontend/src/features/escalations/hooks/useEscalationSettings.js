import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAlertWindowSettings, updateAlertWindowSettings } from '../services/escalations.service';

export const useEscalationSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['escalations', 'settings'],
    queryFn: getAlertWindowSettings,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: updateAlertWindowSettings,
    onSuccess: (newHours) => {
      queryClient.setQueryData(['escalations', 'settings'], newHours);
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', 'attention'] });
      toast.success(`Alert window updated to ${newHours} hour${newHours > 1 ? 's' : ''}`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update alert window';
      toast.error(message);
    }
  });

  return {
    alertWindowHours: query.data ?? 2,
    isLoading: query.isLoading,
    isError: query.isError,
    updateAlertWindow: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending
  };
};

export default useEscalationSettings;
