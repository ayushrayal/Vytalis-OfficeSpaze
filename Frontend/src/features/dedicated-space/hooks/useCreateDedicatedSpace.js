import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createDedicatedSpace } from '../services/dedicatedSpace.service';

export const useCreateDedicatedSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDedicatedSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dedicated-spaces'] });
      toast.success('Dedicated space added successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to add dedicated space';
      toast.error(message);
    }
  });
};

export default useCreateDedicatedSpace;
