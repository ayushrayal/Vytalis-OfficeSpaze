import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getInvoiceTemplatePdf } from '../services/invoiceTemplate.service';

export const useInvoiceTemplatePdf = () => {
  return useMutation({
    mutationFn: getInvoiceTemplatePdf,
    onSuccess: (blobData, id) => {
      try {
        const fileBlob = new Blob([blobData], { type: 'application/pdf' });
        const fileUrl = URL.createObjectURL(fileBlob);
        const newWindow = window.open(fileUrl, '_blank');

        if (!newWindow) {
          toast.info('PDF generated! Click to open.', {
            action: {
              label: 'Open PDF',
              onClick: () => window.open(fileUrl, '_blank')
            }
          });
        } else {
          toast.success('Invoice PDF generated');
        }

        // Clean up object URL after 1 minute
        setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
      } catch (err) {
        toast.error('Unable to open PDF preview');
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Unable to generate invoice PDF';
      toast.error(message);
    }
  });
};

export default useInvoiceTemplatePdf;
