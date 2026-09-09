import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useDashboardSse = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Determine SSE endpoint URL aligned with api base config
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const cleanBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const streamUrl = `${cleanBaseUrl}/dashboard/stream`;

    let eventSource;
    try {
      // Initialize EventSource with HttpOnly cookie credentials
      eventSource = new EventSource(streamUrl, { withCredentials: true });

      const handleDashboardUpdate = (event) => {
        try {
          if (event.data) {
            const data = JSON.parse(event.data);
            console.log('[SSE Dashboard Event Received]:', data.type || data);
          }
        } catch (e) {
          // Ignore parse errors safely
        }
        // Invalidate queries to refetch authoritative metrics, activity, and escalations
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        queryClient.invalidateQueries({ queryKey: ['escalations'] });
      };

      eventSource.addEventListener('dashboard_update', handleDashboardUpdate);
      eventSource.onmessage = handleDashboardUpdate;

      eventSource.onerror = (err) => {
        // EventSource will attempt to auto-reconnect automatically.
        // We log silently without crashing or disturbing the user interface.
        if (process.env.NODE_ENV === 'development') {
          console.debug('[SSE Dashboard Connection Warning]: Connection retrying...', err);
        }
      };
    } catch (err) {
      console.error('[SSE Dashboard Setup Error]:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [queryClient]);
};

export default useDashboardSse;
