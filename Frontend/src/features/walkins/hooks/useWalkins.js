import { useQuery } from '@tanstack/react-query';
import { getWalkins } from '../services/walkin.service';

export const WALKINS_QUERY_KEY = ['walkins'];

export const useWalkins = () => {
  return useQuery({
    queryKey: WALKINS_QUERY_KEY,
    queryFn: getWalkins
  });
};
