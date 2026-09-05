import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWalkin } from '../services/walkin.service';
import { WALKINS_QUERY_KEY } from './useWalkins';
import { toast } from 'sonner';

export const useDeleteWalkin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWalkin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALKINS_QUERY_KEY });
      toast.success('Walk-in deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete walk-in';
      toast.error(message);
    }
  });
};
