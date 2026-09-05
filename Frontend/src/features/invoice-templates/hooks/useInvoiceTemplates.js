import { useQuery } from '@tanstack/react-query';
import { getInvoiceTemplates } from '../services/invoiceTemplate.service';

export const useInvoiceTemplates = () => {
  return useQuery({
    queryKey: ['invoice-templates'],
    queryFn: getInvoiceTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

export default useInvoiceTemplates;
