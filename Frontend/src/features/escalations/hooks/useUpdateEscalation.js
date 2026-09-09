import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateEscalation } from '../services/escalations.service';

export const useUpdateEscalation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEscalation,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', 'attention'] });
      if (updated?.id || updated?._id) {
        queryClient.invalidateQueries({ queryKey: ['escalations', updated.id || updated._id] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast.success('Escalation updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to update escalation';
      toast.error(message);
    }
  });
};

export default useUpdateEscalation;
