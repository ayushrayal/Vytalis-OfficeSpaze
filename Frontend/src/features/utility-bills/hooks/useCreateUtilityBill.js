import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createUtilityBill } from '../services/utilityBills.service';

export const useCreateUtilityBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUtilityBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-bills'] });
      queryClient.invalidateQueries({ queryKey: ['utility-bills', 'due'] });
      toast.success('Utility bill created successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to create utility bill';
      toast.error(message);
    }
  });
};

export default useCreateUtilityBill;
