import { useQuery } from '@tanstack/react-query';
import { getUtilityBills } from '../services/utilityBills.service';

export const useUtilityBills = () => {
  return useQuery({
    queryKey: ['utility-bills'],
    queryFn: getUtilityBills
  });
};

export default useUtilityBills;
