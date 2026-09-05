import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteInvoiceTemplate } from '../services/invoiceTemplate.service';

export const useDeleteInvoiceTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoiceTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
      toast.success('Invoice template deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to delete invoice template';
      toast.error(message);
    }
  });
};

export default useDeleteInvoiceTemplate;
