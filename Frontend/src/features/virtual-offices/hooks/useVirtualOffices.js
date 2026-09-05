import { useQuery } from '@tanstack/react-query';
import { getVirtualOffices } from '../services/virtualOffices.service';

export const useVirtualOffices = () => {
  return useQuery({
    queryKey: ['virtual-offices'],
    queryFn: getVirtualOffices
  });
};

export default useVirtualOffices;
