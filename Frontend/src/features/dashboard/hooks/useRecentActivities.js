import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useRecentActivities = (limit = 10) => {
  return useQuery({
    queryKey: ['recentActivities', { limit }],
    queryFn: async () => {
      const response = await api.get('/activities', {
        params: { limit }
      });
      return response.data?.data?.activities || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false
  });
};

export default useRecentActivities;
