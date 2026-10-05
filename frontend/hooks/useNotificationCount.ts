import { useEffect, useState } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase-client';
import { getUnreadNotificationCount } from '@/lib/api/notifications';

/**
 * Hook to manage unread notification count with real-time updates
 * Uses Supabase real-time subscriptions for instant updates
 */
export function useNotificationCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClientComponentSupabaseClient());

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchCount = async () => {
      try {
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

        // Set up real-time subscription for this user's notifications
        channel = supabase
          .channel('notification-changes')
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`
            },
            async (payload) => {
              console.log('Notification change detected:', payload);
              
              // Refetch the count when notifications change
              const newCount = await getUnreadNotificationCount(
                session.user.id,
                session.access_token
              );
              setCount(newCount);
            }
          )
          .subscribe();

      } catch (error) {
        console.error('Failed to fetch notification count:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCount();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  return { count, loading };
}
