import { useQuery } from '@tanstack/react-query';
import { getManagedOffices } from '../services/managedOffices.service';

export const useManagedOffices = () => {
  return useQuery({
    queryKey: ['managed-offices'],
    queryFn: getManagedOffices
  });
};

export default useManagedOffices;
