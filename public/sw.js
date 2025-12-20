/**
 * QuakeWise Service Worker
 *
 * Handles push notifications for earthquake alerts.
 * This service worker runs in the background even when the app is closed.
 */

const CACHE_NAME = 'quakewise-alerts-v1';

// Install event - called when service worker is first installed
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - called when service worker takes control
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
});

// Push event - called when a push notification is received
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  if (!event.data) {
    console.warn('[SW] Push event but no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
    return;
  }

  const options = {
    body: data.body || 'New earthquake detected',
    icon: data.icon || '/images/logo-192.png',
    badge: data.badge || '/images/badge-72.png',
    tag: data.tag || 'earthquake-alert',
    data: data.data || {},
    actions: data.actions || [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    requireInteraction: data.requireInteraction || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now(),
    renotify: true, // Notify even if same tag
  };

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(data.title || 'Earthquake Alert', options)
  );
});

// Notification click event - called when user clicks notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  // Close the notification
  event.notification.close();

  const data = event.notification.data || {};

  if (event.action === 'dismiss') {
    // Just close, don't open anything
    return;
  }

  // Handle reassessment reminder clicks
  if (event.action === 'reassess' || data.type === 'reassessment_reminder') {
    // Navigate to the assessment result page with reassess flag
    const urlToOpen = data.url || `/result/${data.assessmentId}?reassess=true`;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          for (const client of windowClients) {
            if (client.url.includes(self.location.origin)) {
              client.navigate(urlToOpen);
              return client.focus();
            }
          }
          return clients.openWindow(urlToOpen);
        })
    );
    return;
  }

  // Default action or 'view' action - open the app
  const urlToOpen = data.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if app is already open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin)) {
            // Navigate existing window to the notification URL
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if app is not open
        return clients.openWindow(urlToOpen);
      })
  );
});

// Notification close event - called when notification is dismissed
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');

  const data = event.notification.data || {};

  // Optionally track dismissal
  if (data.notificationId) {
    // Could send to analytics or mark as dismissed
    // fetch('/api/alerts/notifications/' + data.notificationId, { method: 'PATCH', body: JSON.stringify({ dismissed: true }) });
  }
});

// Background sync event - for offline queued actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Sync pending notification acknowledgments
async function syncNotifications() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const pendingAcks = await cache.match('pending-acks');

    if (pendingAcks) {
      const acks = await pendingAcks.json();

      for (const ack of acks) {
        try {
          await fetch(`/api/alerts/notifications/${ack.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'READ' }),
          });
        } catch (e) {
          console.error('[SW] Failed to sync ack:', e);
        }
      }

      // Clear pending acks
      await cache.delete('pending-acks');
    }
  } catch (e) {
    console.error('[SW] Sync failed:', e);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);

  if (event.tag === 'check-earthquakes') {
    // Could check for new earthquakes in background
    // This is currently not widely supported
  }
});

// Message event - for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker script loaded');
