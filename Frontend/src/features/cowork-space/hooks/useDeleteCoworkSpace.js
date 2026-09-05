import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteCoworkSpace } from '../services/coworkSpace.service';

export const useDeleteCoworkSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCoworkSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cowork-spaces'] });
      toast.success('Cowork space deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to delete cowork space';
      toast.error(message);
    }
  });
};

export default useDeleteCoworkSpace;
