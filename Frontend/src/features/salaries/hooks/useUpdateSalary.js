import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateSalary } from '../services/salaries.service';

export const useUpdateSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateSalary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      toast.success('Salary record updated successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to update salary record';
      toast.error(message);
    }
  });
};

export default useUpdateSalary;
