import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateManagedOffice } from '../services/managedOffices.service';

export const useUpdateManagedOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateManagedOffice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-offices'] });
      toast.success('Managed office updated successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to update managed office';
      toast.error(message);
    }
  });
};

export default useUpdateManagedOffice;
