import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteUtilityBill } from '../services/utilityBills.service';

export const useDeleteUtilityBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteUtilityBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-bills'] });
      queryClient.invalidateQueries({ queryKey: ['utility-bills', 'due'] });
      toast.success('Utility bill deleted successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to delete utility bill';
      toast.error(message);
    }
  });
};

export default useDeleteUtilityBill;
