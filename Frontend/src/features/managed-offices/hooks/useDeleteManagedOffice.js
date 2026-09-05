import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteManagedOffice } from '../services/managedOffices.service';

export const useDeleteManagedOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteManagedOffice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-offices'] });
      toast.success('Managed office deleted successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to delete managed office';
      toast.error(message);
    }
  });
};

export default useDeleteManagedOffice;
