import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateInvoiceTemplate } from '../services/invoiceTemplate.service';

export const useUpdateInvoiceTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateInvoiceTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
      toast.success('Invoice template updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to update invoice template';
      toast.error(message);
    }
  });
};

export default useUpdateInvoiceTemplate;
