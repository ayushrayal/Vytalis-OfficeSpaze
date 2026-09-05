import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteSalary } from '../services/salaries.service';

export const useDeleteSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteSalary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      toast.success('Salary record deleted successfully');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Unable to delete salary record';
      toast.error(message);
    }
  });
};

export default useDeleteSalary;
