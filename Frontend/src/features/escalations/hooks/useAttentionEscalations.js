import { useQuery } from '@tanstack/react-query';
import { getAttentionEscalations } from '../services/escalations.service';

export const useAttentionEscalations = () => {
  return useQuery({
    queryKey: ['escalations', 'attention'],
    queryFn: getAttentionEscalations,
    staleTime: 1000 * 30 // 30 seconds
  });
};

export default useAttentionEscalations;
