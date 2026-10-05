import { useQuery } from '@tanstack/react-query';
import { getWalkin } from '../services/walkin.service';

export const WALKIN_DETAIL_QUERY_KEY = 'walkin';

export const useWalkin = (id) => {
  return useQuery({
    queryKey: [WALKIN_DETAIL_QUERY_KEY, id],
    queryFn: () => getWalkin(id),
    enabled: Boolean(id)
  });
};
