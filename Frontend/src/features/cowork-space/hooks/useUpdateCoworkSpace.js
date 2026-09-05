import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateCoworkSpace } from '../services/coworkSpace.service';

export const useUpdateCoworkSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCoworkSpace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cowork-spaces'] });
      toast.success('Cowork space updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to update cowork space';
      toast.error(message);
    }
  });
};

export default useUpdateCoworkSpace;
