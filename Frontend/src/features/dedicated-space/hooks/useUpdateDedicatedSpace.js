import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateDedicatedSpace } from '../services/dedicatedSpace.service';

export const useUpdateDedicatedSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateDedicatedSpace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dedicated-spaces'] });
      toast.success('Dedicated space updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to update dedicated space';
      toast.error(message);
    }
  });
};

export default useUpdateDedicatedSpace;
