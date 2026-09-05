import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createVirtualOffice } from '../services/virtualOffices.service';

export const useCreateVirtualOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualOffice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-offices'] });
      toast.success('Virtual office created successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to create virtual office';
      toast.error(message);
    }
  });
};

export default useCreateVirtualOffice;
