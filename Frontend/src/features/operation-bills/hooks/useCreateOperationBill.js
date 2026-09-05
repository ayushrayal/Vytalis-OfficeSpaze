import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createOperationBill } from '../services/operationBills.service';

export const useCreateOperationBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOperationBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-bills'] });
      toast.success('Operation bill added successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to add operation bill';
      toast.error(message);
    }
  });
};

export default useCreateOperationBill;
