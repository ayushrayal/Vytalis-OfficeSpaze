import { useQuery } from '@tanstack/react-query';
import { getAggregators } from '../services/aggregators.service';

export const useAggregators = () => {
  return useQuery({
    queryKey: ['aggregators'],
    queryFn: getAggregators
  });
};

export default useAggregators;
