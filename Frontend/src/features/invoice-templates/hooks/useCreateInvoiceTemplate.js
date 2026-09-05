import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createInvoiceTemplate } from '../services/invoiceTemplate.service';

export const useCreateInvoiceTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoiceTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
      toast.success('Invoice template created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to create invoice template';
      toast.error(message);
    }
  });
};

export default useCreateInvoiceTemplate;
