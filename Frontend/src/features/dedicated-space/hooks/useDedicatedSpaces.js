import { useQuery } from '@tanstack/react-query';
import { getDedicatedSpaces } from '../services/dedicatedSpace.service';

export const useDedicatedSpaces = () => {
  return useQuery({
    queryKey: ['dedicated-spaces'],
    queryFn: getDedicatedSpaces,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

export default useDedicatedSpaces;
