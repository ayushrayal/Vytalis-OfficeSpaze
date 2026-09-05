import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteDedicatedSpace } from '../services/dedicatedSpace.service';

export const useDeleteDedicatedSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDedicatedSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dedicated-spaces'] });
      toast.success('Dedicated space deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to delete dedicated space';
      toast.error(message);
    }
  });
};

export default useDeleteDedicatedSpace;
