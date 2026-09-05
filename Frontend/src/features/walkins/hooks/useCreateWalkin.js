import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWalkin } from '../services/walkin.service';
import { WALKINS_QUERY_KEY } from './useWalkins';
import { toast } from 'sonner';

export const useCreateWalkin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWalkin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALKINS_QUERY_KEY });
      toast.success('Walk-in created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create walk-in';
      toast.error(message);
    }
  });
};
