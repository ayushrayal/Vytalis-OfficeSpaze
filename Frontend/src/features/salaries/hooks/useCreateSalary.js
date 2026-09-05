import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSalary } from '../services/salaries.service';

export const useCreateSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      toast.success('Salary record added successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to add salary record';
      toast.error(message);
    }
  });
};

export default useCreateSalary;
