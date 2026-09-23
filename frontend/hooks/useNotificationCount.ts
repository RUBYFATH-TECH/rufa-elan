import { useEffect, useState } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase-client';
import { getUnreadNotificationCount } from '@/lib/api/notifications';

/**
 * Hook to manage unread notification count
 * Polls the backend every 30 seconds for updates
 */
export function useNotificationCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const fetchCount = async () => {
      try {
        const supabase = createClientComponentSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user?.id || !session?.access_token) {
          setCount(0);
          setLoading(false);
          return;
        }

        const unreadCount = await getUnreadNotificationCount(
          session.user.id,
          session.access_token
        );
        
        setCount(unreadCount);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCount();

    // Poll every 30 seconds
    interval = setInterval(fetchCount, 30000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return { count, loading };
}
