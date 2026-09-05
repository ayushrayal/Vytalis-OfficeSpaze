import { useQuery } from '@tanstack/react-query';
import { getSalaries } from '../services/salaries.service';

export const useSalaries = () => {
  return useQuery({
    queryKey: ['salaries'],
    queryFn: getSalaries
  });
};

export default useSalaries;
