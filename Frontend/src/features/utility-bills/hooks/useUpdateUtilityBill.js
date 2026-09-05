import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateUtilityBill } from '../services/utilityBills.service';

export const useUpdateUtilityBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateUtilityBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-bills'] });
      queryClient.invalidateQueries({ queryKey: ['utility-bills', 'due'] });
      toast.success('Utility bill updated successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to update utility bill';
      toast.error(message);
    }
  });
};

export default useUpdateUtilityBill;
