import { useQuery } from '@tanstack/react-query';
import { getCoworkSpaces } from '../services/coworkSpace.service';

export const useCoworkSpaces = () => {
  return useQuery({
    queryKey: ['cowork-spaces'],
    queryFn: getCoworkSpaces,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

export default useCoworkSpaces;
