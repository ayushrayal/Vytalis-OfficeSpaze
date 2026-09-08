import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteAggregator } from '../services/aggregators.service';

export const useDeleteAggregator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteAggregator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aggregators'] });
      toast.success('Aggregator deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to delete aggregator';
      toast.error(message);
    }
  });
};

export default useDeleteAggregator;
