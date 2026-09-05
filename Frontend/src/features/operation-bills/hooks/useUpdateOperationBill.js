import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateOperationBill } from '../services/operationBills.service';

export const useUpdateOperationBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateOperationBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-bills'] });
      toast.success('Operation bill updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to update operation bill';
      toast.error(message);
    }
  });
};

export default useUpdateOperationBill;
