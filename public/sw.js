/**
 * QuakeWise Service Worker
 *
 * Handles:
 * - Push notifications for earthquake alerts
 * - Offline caching for PWA functionality
 * - Background sync for pending operations
 *
 * This service worker runs in the background even when the app is closed.
 */

const CACHE_NAME = 'quakewise-v2';
const STATIC_CACHE = 'quakewise-static-v2';
const DYNAMIC_CACHE = 'quakewise-dynamic-v1';

// Assets to pre-cache during install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/logo.svg',
];

// Offline fallback page
const OFFLINE_PAGE = '/offline.html';

// Paths that should use network-first strategy
const NETWORK_FIRST_PATHS = [
  '/api/',
  '/assessment/',
  '/dashboard',
  '/result/',
];

// Paths that should use cache-first strategy
const CACHE_FIRST_PATHS = [
  '/icons/',
  '/images/',
  '/_next/static/',
  '/cdn/',
];

// Install event - called when service worker is first installed
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        // Use addAll with error handling for missing assets
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to cache ${url}:`, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Service Worker installed');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - called when service worker takes control
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');

  event.waitUntil(
    // Clean up old caches
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete caches that don't match current version
              return cacheName !== CACHE_NAME &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        // Take control of all clients immediately
        return clients.claim();
      })
  );
});

// Fetch event - handles caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip cross-origin requests except for specific CDNs
  if (url.origin !== self.location.origin) {
    // Allow caching of external CDN resources
    if (!url.hostname.includes('googleapis.com') &&
        !url.hostname.includes('gstatic.com') &&
        !url.hostname.includes('cloudflare.com')) {
      return;
    }
  }

  // Determine caching strategy based on path
  const pathname = url.pathname;

  // Network-first for dynamic content (API, pages with user data)
  if (NETWORK_FIRST_PATHS.some((path) => pathname.startsWith(path))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets
  if (CACHE_FIRST_PATHS.some((path) => pathname.startsWith(path))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale-while-revalidate for everything else (HTML pages, etc.)
  event.respondWith(staleWhileRevalidate(request));
});

// Cache-first strategy: Check cache, fallback to network
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first strategy: Try network, fallback to cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) {
        return offlinePage;
      }
      // Fallback if offline page not cached
      return new Response('You are offline. Please check your connection.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html' }
      });
    }
    throw error;
  }
}

// Stale-while-revalidate: Return cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await caches.match(request);

  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(async (error) => {
      console.log('[SW] Revalidation failed:', error);
      // If we have a cached response, return it
      if (cachedResponse) {
        return cachedResponse;
      }
      // For navigation requests, return offline page
      if (request.mode === 'navigate') {
        const offlinePage = await caches.match(OFFLINE_PAGE);
        if (offlinePage) {
          return offlinePage;
        }
      }
      throw error;
    });

  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

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
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
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
