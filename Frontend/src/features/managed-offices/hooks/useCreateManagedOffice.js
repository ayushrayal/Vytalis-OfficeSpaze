import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createManagedOffice } from '../services/managedOffices.service';

export const useCreateManagedOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createManagedOffice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-offices'] });
      toast.success('Managed office added successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to create managed office';
      toast.error(message);
    }
  });
};

export default useCreateManagedOffice;
