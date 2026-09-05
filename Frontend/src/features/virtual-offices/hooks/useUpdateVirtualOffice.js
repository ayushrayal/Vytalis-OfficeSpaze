import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateVirtualOffice } from '../services/virtualOffices.service';

export const useUpdateVirtualOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualOffice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-offices'] });
      toast.success('Virtual office updated successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to update virtual office';
      toast.error(message);
    }
  });
};

export default useUpdateVirtualOffice;
