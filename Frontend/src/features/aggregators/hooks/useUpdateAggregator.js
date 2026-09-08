import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateAggregator } from '../services/aggregators.service';

export const useUpdateAggregator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAggregator(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['aggregators'] });
      queryClient.invalidateQueries({ queryKey: ['aggregators', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['virtual-offices'] });
      toast.success('Aggregator updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to update aggregator';
      toast.error(message);
    }
  });
};

export default useUpdateAggregator;
