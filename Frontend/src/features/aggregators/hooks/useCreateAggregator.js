import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createAggregator } from '../services/aggregators.service';

export const useCreateAggregator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAggregator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aggregators'] });
      toast.success('Aggregator created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to create aggregator';
      toast.error(message);
    }
  });
};

export default useCreateAggregator;
