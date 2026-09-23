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
        let eventType = '';
        let eventPayload = null;
        try {
          if (event.data) {
            eventPayload = JSON.parse(event.data);
            eventType = eventPayload.type || '';
            console.log('[SSE Dashboard Event Received]:', eventType);
          }
        } catch (e) {
          // Ignore parse errors safely
        }
        // Invalidate dashboard metrics and recent activities
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        queryClient.invalidateQueries({ queryKey: ['recentActivities'] });

        // Invalidate users queries when a user mutation event arrives
        if (eventType === 'USER_MUTATED' || eventType.includes('USER')) {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }

        // Only invalidate escalations if the event relates to escalations
        if (eventType && (eventType.startsWith('ESCALATION_') || eventType.includes('ESCALATION'))) {
          queryClient.invalidateQueries({ queryKey: ['escalations'] });
        }

        // Invalidate leads and sync status queries when a Meta Leads sync event arrives
        if (eventType === 'META_LEADS_SYNCED' || eventType.includes('META_LEADS')) {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          queryClient.invalidateQueries({ queryKey: ['leadSyncStatus'] });
          queryClient.invalidateQueries({ queryKey: ['leadStats'] });
          queryClient.invalidateQueries({ queryKey: ['leadAnalytics'] });
        }

        // Invalidate leads when a lead mutation event arrives (assignment, status, notes, follow-up, bulk)
        if (eventType === 'LEAD_MUTATED' || eventType === 'LEADS_BULK_MUTATED') {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          queryClient.invalidateQueries({ queryKey: ['leadStats'] });
          queryClient.invalidateQueries({ queryKey: ['leadAnalytics'] });
          if (eventPayload?.entityId) {
            queryClient.invalidateQueries({ queryKey: ['lead', eventPayload.entityId] });
            queryClient.invalidateQueries({ queryKey: ['leadActivity', eventPayload.entityId] });
          }
        }

        // Invalidate follow-ups when follow-up mutation arrives
        if (eventType === 'LEAD_FOLLOWUP_MUTATED') {
          queryClient.invalidateQueries({ queryKey: ['followUps'] });
          queryClient.invalidateQueries({ queryKey: ['followUpMetrics'] });
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          queryClient.invalidateQueries({ queryKey: ['leadStats'] });
          queryClient.invalidateQueries({ queryKey: ['leadAnalytics'] });
          if (eventPayload?.entityId) {
            queryClient.invalidateQueries({ queryKey: ['lead', eventPayload.entityId] });
            queryClient.invalidateQueries({ queryKey: ['leadFollowUps', eventPayload.entityId] });
            queryClient.invalidateQueries({ queryKey: ['leadActivity', eventPayload.entityId] });
          }
        }
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
