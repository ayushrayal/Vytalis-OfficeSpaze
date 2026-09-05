import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWalkin } from '../services/walkin.service';
import { WALKINS_QUERY_KEY } from './useWalkins';
import { toast } from 'sonner';

export const useUpdateWalkin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateWalkin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALKINS_QUERY_KEY });
      toast.success('Walk-in updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update walk-in';
      toast.error(message);
    }
  });
};
