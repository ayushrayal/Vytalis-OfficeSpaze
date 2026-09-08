import { useQuery } from '@tanstack/react-query';
import { getAggregator } from '../services/aggregators.service';

export const useAggregatorDetails = (id) => {
  return useQuery({
    queryKey: ['aggregators', id],
    queryFn: () => getAggregator(id),
    enabled: Boolean(id)
  });
};

export default useAggregatorDetails;
