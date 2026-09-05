import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCoworkSpace } from '../services/coworkSpace.service';

export const useCreateCoworkSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCoworkSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cowork-spaces'] });
      toast.success('Cowork space added successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to add cowork space';
      toast.error(message);
    }
  });
};

export default useCreateCoworkSpace;
