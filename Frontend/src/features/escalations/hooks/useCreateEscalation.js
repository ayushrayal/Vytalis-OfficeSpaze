import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createEscalation } from '../services/escalations.service';

export const useCreateEscalation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEscalation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', 'attention'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast.success('Escalation created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to create escalation';
      toast.error(message);
    }
  });
};

export default useCreateEscalation;
