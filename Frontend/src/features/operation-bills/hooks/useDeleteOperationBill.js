import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteOperationBill } from '../services/operationBills.service';

export const useDeleteOperationBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOperationBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-bills'] });
      toast.success('Operation bill deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to delete operation bill';
      toast.error(message);
    }
  });
};

export default useDeleteOperationBill;
