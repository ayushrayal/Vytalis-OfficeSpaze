import { useQuery } from '@tanstack/react-query';
import { getWalkins, getGlobalWalkinFollowUps } from '../services/walkin.service';

export const WALKINS_QUERY_KEY = ['walkins'];
export const WALKIN_GLOBAL_FOLLOWUPS_QUERY_KEY = ['walkin-follow-ups'];

export const useWalkins = (filters = {}) => {
  return useQuery({
    queryKey: [WALKINS_QUERY_KEY[0], filters],
    queryFn: () => getWalkins(filters)
  });
};

export const useWalkinFollowUpsList = (params = {}) => {
  return useQuery({
    queryKey: [WALKIN_GLOBAL_FOLLOWUPS_QUERY_KEY[0], params],
    queryFn: () => getGlobalWalkinFollowUps(params)
  });
};

