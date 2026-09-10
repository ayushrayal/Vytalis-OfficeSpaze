import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useRecentActivities = (options = {}) => {
  const { page = 1, limit = 10, entityType = '' } =
    typeof options === 'number' ? { limit: options } : options;

  return useQuery({
    queryKey: ['recentActivities', { page, limit, entityType }],
    queryFn: async () => {
      const params = { page, limit };
      if (entityType && typeof entityType === 'string' && entityType.trim()) {
        params.entityType = entityType.trim();
      }

      const response = await api.get('/activities', { params });
      return (
        response.data?.data || {
          activities: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      );
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false
  });
};

export default useRecentActivities;
