'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ProgressUpdate {
  missionId: number;
  userId: string;
  progress: number;
  status: string;
  timestamp: string;
}

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export function useRealtimeProgress() {
  const { user, isAuthenticated } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Setup realtime subscription
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const setupRealtimeConnection = () => {
      try {
        // Create channel for user-specific updates
        const userChannel = supabase.channel(`user_progress:${user.id}`, {
          config: {
            broadcast: { self: true },
            presence: { key: user.id }
          }
        });

        // Subscribe to user mission updates
        userChannel
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_missions',
            filter: `user_id=eq.${user.id}`
          }, (payload) => {
            console.log('Mission progress update:', payload);
            handleProgressUpdate(payload.new);
            setLastUpdate(new Date());
          })
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'paybacks',
            filter: `user_id=eq.${user.id}`
          }, (payload) => {
            console.log('Payback update:', payload);
            handlePaybackUpdate(payload.new);
            setLastUpdate(new Date());
          })
          .on('broadcast', { event: 'user_activity' }, (payload) => {
            console.log('User activity broadcast:', payload);
            handleUserActivity(payload.payload);
          })
          .subscribe((status) => {
            console.log('Realtime connection status:', status);
            
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setConnectionError(null);
              console.log('✅ Realtime connection established');
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              setConnectionError('Connection failed');
              console.error('❌ Realtime connection failed');
              scheduleReconnect();
            } else if (status === 'TIMED_OUT') {
              setIsConnected(false);
              setConnectionError('Connection timed out');
              console.error('⏰ Realtime connection timed out');
              scheduleReconnect();
            } else if (status === 'CLOSED') {
              setIsConnected(false);
              setConnectionError('Connection closed');
              console.warn('🔒 Realtime connection closed');
              scheduleReconnect();
            }
          });

        channelRef.current = userChannel;

        // Setup presence (optional - for showing online users)
        userChannel.track({
          user_id: user.id,
          user_name: user.name,
          online_at: new Date().toISOString()
        });

      } catch (error) {
        console.error('Failed to setup realtime connection:', error);
        setConnectionError(error instanceof Error ? error.message : 'Unknown error');
        scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Exponential backoff: 2s, 4s, 8s, max 30s
      const retryDelay = Math.min(2000 * Math.pow(2, Math.random()), 30000);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        cleanup();
        setupRealtimeConnection();
      }, retryDelay);
    };

    const cleanup = () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setIsConnected(false);
    };

    // Initialize connection
    setupRealtimeConnection();

    // Cleanup on unmount
    return cleanup;
  }, [isAuthenticated, user?.id]);

  // Handle progress updates
  const handleProgressUpdate = (update: any) => {
    const store = useAppStore.getState();
    
    // Update the mission progress in the store
    const updatedUserMission = {
      id: update.id,
      userId: update.user_id,
      missionId: update.mission_id,
      status: update.status,
      proofData: update.proof_data,
      completedAt: update.completed_at,
      createdAt: update.created_at
    };

    store.updateUserMission(updatedUserMission);

    // Trigger success animation if completed
    if (update.status === 'completed' || update.status === 'verified') {
      triggerSuccessNotification(update);
    }
  };

  // Handle payback updates
  const handlePaybackUpdate = (update: any) => {
    const store = useAppStore.getState();
    
    // Reload payback data to get the latest total
    store.loadPaybacks();

    // Trigger payback notification
    triggerPaybackNotification(update);
  };

  // Handle user activity broadcasts
  const handleUserActivity = (activity: UserActivity) => {
    // Could be used to show social feed updates
    console.log('Social activity:', activity);
    
    // Trigger social proof notifications
    if (activity.action.includes('completed') || activity.action.includes('received')) {
      showSocialProofNotification(activity);
    }
  };

  // Trigger success notification
  const triggerSuccessNotification = (update: any) => {
    // Could trigger particle effects, sound, or push notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('미션 완료!', {
        body: '미션이 성공적으로 완료되었습니다! 🎉',
        icon: '/icon-192x192.png',
        tag: `mission-${update.mission_id}`
      });
    }

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // Trigger payback notification
  const triggerPaybackNotification = (update: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('페이백 적립!', {
        body: `${update.amount.toLocaleString()}원이 적립되었습니다! 💰`,
        icon: '/icon-192x192.png',
        tag: `payback-${update.id}`
      });
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // Show social proof notification
  const showSocialProofNotification = (activity: UserActivity) => {
    // This could trigger toast notifications or update social feed
    console.log('Social proof:', `${activity.userName} ${activity.action}`);
  };

  // Broadcast user activity (for social features)
  const broadcastActivity = async (action: string, metadata?: Record<string, any>) => {
    if (!channelRef.current || !user) return;

    const activity: UserActivity = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      action,
      metadata,
      timestamp: new Date().toISOString()
    };

    try {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'user_activity',
        payload: activity
      });
    } catch (error) {
      console.error('Failed to broadcast activity:', error);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  return {
    // Connection status
    isConnected,
    connectionError,
    lastUpdate,
    
    // Methods
    broadcastActivity,
    requestNotificationPermission,
    
    // Connection info
    channelInfo: {
      channelName: channelRef.current?.topic || null,
      subscriptionState: channelRef.current?.state || 'closed'
    }
  };
}

// Hook for tracking mission progress specifically
export function useMissionProgress(missionId: number) {
  const { userMissions } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('pending');

  useEffect(() => {
    const userMission = userMissions.find(um => um.missionId === missionId);
    
    if (userMission) {
      setStatus(userMission.status);
      
      // Calculate progress percentage based on status
      const progressMap = {
        'pending': 0,
        'in_progress': 50,
        'completed': 90,
        'verified': 100
      };
      
      setProgress(progressMap[userMission.status as keyof typeof progressMap] || 0);
    } else {
      setStatus('pending');
      setProgress(0);
    }
  }, [userMissions, missionId]);

  return { progress, status };
}

// Hook for social activity feed
export function useSocialFeed(limit: number = 10) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock social activities for now
    // In a real app, this would fetch from a social_activities table
    const mockActivities: UserActivity[] = [
      {
        id: '1',
        userId: 'user1',
        userName: '김○○',
        action: '재능충 챌린지 완료로 20,000원 받았습니다',
        metadata: { amount: 20000, missionType: 'challenge' },
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() // 2 minutes ago
      },
      {
        id: '2',
        userId: 'user2',
        userName: '이○○',
        action: 'SNS 인증 미션 완료',
        metadata: { amount: 10000, missionType: 'sns' },
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
      },
      {
        id: '3',
        userId: 'user3',
        userName: '박○○',
        action: '친구 추천으로 50,000원 받았습니다',
        metadata: { amount: 50000, missionType: 'referral' },
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString() // 8 minutes ago
      }
    ];

    setActivities(mockActivities.slice(0, limit));
    setIsLoading(false);
  }, [limit]);

  return { activities, isLoading };
}