import { useQuery } from '@tanstack/react-query';
import { getOperationBills } from '../services/operationBills.service';

export const useOperationBills = () => {
  return useQuery({
    queryKey: ['operation-bills'],
    queryFn: getOperationBills,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

export default useOperationBills;
