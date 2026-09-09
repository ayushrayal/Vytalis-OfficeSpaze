import { useQuery } from '@tanstack/react-query';
import { getEscalation } from '../services/escalations.service';

export const useEscalationDetails = (id) => {
  return useQuery({
    queryKey: ['escalations', id],
    queryFn: () => getEscalation(id),
    enabled: Boolean(id)
  });
};

export default useEscalationDetails;
