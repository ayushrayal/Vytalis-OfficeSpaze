import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resolveEscalation } from '../services/escalations.service';

export const useResolveEscalation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resolveEscalation,
    onSuccess: (resolved) => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', 'attention'] });
      if (resolved?.id || resolved?._id) {
        queryClient.invalidateQueries({ queryKey: ['escalations', resolved.id || resolved._id] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast.success('Escalation marked as resolved');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to resolve escalation';
      toast.error(message);
    }
  });
};

export default useResolveEscalation;
