import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteEscalation } from '../services/escalations.service';

export const useDeleteEscalation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEscalation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', 'attention'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast.success('Escalation deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to delete escalation';
      toast.error(message);
    }
  });
};

export default useDeleteEscalation;
