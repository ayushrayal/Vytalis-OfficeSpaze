import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteVirtualOffice } from '../services/virtualOffices.service';

export const useDeleteVirtualOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteVirtualOffice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-offices'] });
      toast.success('Virtual office deleted successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to delete virtual office';
      toast.error(message);
    }
  });
};

export default useDeleteVirtualOffice;
