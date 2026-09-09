import { useQuery } from '@tanstack/react-query';
import { getEscalations } from '../services/escalations.service';

export const useEscalations = (params = {}) => {
  return useQuery({
    queryKey: ['escalations', params],
    queryFn: () => getEscalations(params),
    staleTime: 1000 * 30 // 30 seconds
  });
};

export default useEscalations;
