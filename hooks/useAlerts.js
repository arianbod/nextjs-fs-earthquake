/**
 * useAlerts Hook
 *
 * Custom hook for managing earthquake alerts:
 * - Fetching user preferences
 * - Getting recent earthquakes
 * - Managing notifications
 * - Push subscription handling
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Check if push notifications are supported
const isPushSupported = () => {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;
};

// Register service worker
async function registerServiceWorker() {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  return registration;
}

/**
 * Hook for alert preferences
 */
export function useAlertPreferences() {
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['alertPreferences'],
    queryFn: async () => {
      const response = await fetch('/api/alerts/preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');
      const data = await response.json();
      return data.preferences;
    },
    staleTime: 30000, // 30 seconds
  });

  const updateMutation = useMutation({
    mutationFn: async (newPreferences) => {
      const response = await fetch('/api/alerts/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertPreferences'] });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    refetch,
    updatePreferences: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook for recent earthquakes
 */
export function useRecentEarthquakes(options = {}) {
  const {
    hours = 24,
    minMagnitude = 2,
    lat,
    lng,
    radius = 500,
    enabled = true,
    refetchInterval = 60000, // 1 minute
  } = options;

  const queryParams = new URLSearchParams({
    hours: hours.toString(),
    minMagnitude: minMagnitude.toString(),
    limit: '100',
  });

  if (lat && lng) {
    queryParams.set('lat', lat.toString());
    queryParams.set('lng', lng.toString());
    queryParams.set('radius', radius.toString());
  }

  return useQuery({
    queryKey: ['earthquakes', { hours, minMagnitude, lat, lng, radius }],
    queryFn: async () => {
      const response = await fetch(`/api/alerts/events?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch earthquakes');
      const data = await response.json();
      return data.data;
    },
    enabled,
    refetchInterval,
    staleTime: 30000,
  });
}

/**
 * Hook for user notifications
 */
export function useAlertNotifications(options = {}) {
  const { status = 'all', limit = 50, enabled = true } = options;
  const queryClient = useQueryClient();

  const queryParams = new URLSearchParams({
    status,
    limit: limit.toString(),
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['alertNotifications', { status, limit }],
    queryFn: async () => {
      const response = await fetch(`/api/alerts/notifications?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled,
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async ({ ids, markAll }) => {
      const response = await fetch('/api/alerts/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          markAll ? { action: 'markAllRead' } : { action: 'markRead', ids }
        ),
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertNotifications'] });
    },
  });

  return {
    notifications: data?.data?.notifications || [],
    total: data?.data?.total || 0,
    unreadCount: data?.data?.unreadCount || 0,
    isLoading,
    error,
    refetch,
    markAsRead: (ids) => markAsReadMutation.mutateAsync({ ids }),
    markAllAsRead: () => markAsReadMutation.mutateAsync({ markAll: true }),
    isMarkingRead: markAsReadMutation.isPending,
  };
}

/**
 * Hook for push notification subscription
 */
export function usePushSubscription() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check support and current subscription status
  useEffect(() => {
    async function checkSubscription() {
      setIsLoading(true);
      try {
        if (!isPushSupported()) {
          setIsSupported(false);
          return;
        }
        setIsSupported(true);

        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();

        setSubscription(existingSub);
        setIsSubscribed(!!existingSub);
      } catch (error) {
        console.error('Error checking push subscription:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkSubscription();
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isPushSupported()) {
      throw new Error('Push notifications not supported');
    }

    try {
      // Get VAPID public key from server (would need an API endpoint)
      // For now, use environment variable
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error('Push notifications not configured');
      }

      const registration = await registerServiceWorker();

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Send subscription to server
      const response = await fetch('/api/alerts/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WEB_PUSH',
          subscription: {
            endpoint: pushSubscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')),
              auth: arrayBufferToBase64(pushSubscription.getKey('auth')),
            },
          },
          deviceInfo: {
            browser: getBrowserName(),
            platform: 'web',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setSubscription(pushSubscription);
      setIsSubscribed(true);

      return { success: true };
    } catch (error) {
      console.error('Subscribe error:', error);
      throw error;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();

      // Remove from server
      await fetch('/api/alerts/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      setSubscription(null);
      setIsSubscribed(false);

      return { success: true };
    } catch (error) {
      console.error('Unsubscribe error:', error);
      throw error;
    }
  }, [subscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}

// Utility functions
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

// Export combined hook
export function useAlerts() {
  const preferences = useAlertPreferences();
  const notifications = useAlertNotifications();
  const push = usePushSubscription();

  return {
    ...preferences,
    ...notifications,
    push,
  };
}
