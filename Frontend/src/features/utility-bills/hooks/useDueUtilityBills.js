import { useQuery } from '@tanstack/react-query';
import { getDueUtilityBills } from '../services/utilityBills.service';

export const useDueUtilityBills = () => {
  return useQuery({
    queryKey: ['utility-bills', 'due'],
    queryFn: getDueUtilityBills
  });
};

export default useDueUtilityBills;
