/**
 * Push Notification Service
 *
 * Handles Web Push notifications for earthquake alerts.
 * Supports both VAPID Web Push protocol.
 */

import webpush from 'web-push';
import prisma from '@/lib/db/prisma';

// Initialize Web Push with VAPID details
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'alerts@quakewise.com';

// Only set VAPID details if keys are configured
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${VAPID_EMAIL}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

/**
 * Check if push notifications are configured
 * @returns {boolean}
 */
export function isPushConfigured() {
  return !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

/**
 * Get VAPID public key for client subscription
 * @returns {string|null}
 */
export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY || null;
}

/**
 * Send notification to a single push subscription
 * @param {Object} subscription - Push subscription from database
 * @param {Object} notification - Notification to send
 * @returns {Promise<Object>} Result with success status
 */
export async function sendPushNotification(subscription, notification) {
  if (!isPushConfigured()) {
    console.warn('Push notifications not configured - missing VAPID keys');
    return { success: false, error: 'Push not configured' };
  }

  if (subscription.type !== 'WEB_PUSH') {
    return { success: false, error: 'FCM not yet supported' };
  }

  if (!subscription.endpoint || !subscription.p256dhKey || !subscription.authKey) {
    return { success: false, error: 'Invalid subscription data' };
  }

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: '/images/logo-192.png',
    badge: '/images/badge-72.png',
    tag: `earthquake-${notification.earthquakeId}`,
    data: {
      type: 'earthquake_alert',
      notificationId: notification.id,
      earthquakeId: notification.earthquakeId,
      priority: notification.priority,
      url: `/dashboard?alert=${notification.earthquakeId}`,
    },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    requireInteraction: notification.priority === 'CRITICAL',
    vibrate: notification.priority === 'CRITICAL'
      ? [200, 100, 200, 100, 200]
      : [200, 100, 200],
  });

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dhKey,
      auth: subscription.authKey,
    },
  };

  try {
    await webpush.sendNotification(pushSubscription, payload);

    // Update last used timestamp
    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: {
        lastUsed: new Date(),
        failureCount: 0,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(`Push notification failed for subscription ${subscription.id}:`, error);

    // Handle subscription expiration
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription is no longer valid - deactivate it
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { active: false },
      });

      return { success: false, error: 'Subscription expired', expired: true };
    }

    // Increment failure count
    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: {
        failureCount: { increment: 1 },
      },
    });

    return { success: false, error: error.message };
  }
}

/**
 * Send notification to all of a user's active subscriptions
 * @param {Object} notification - Notification with preferences relation
 * @returns {Promise<Object>} Results summary
 */
export async function sendToUser(notification) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId: notification.userId,
      active: true,
    },
  });

  if (subscriptions.length === 0) {
    return { success: false, sent: 0, failed: 0, error: 'No active subscriptions' };
  }

  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, notification))
  );

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success
  ).length;

  const failed = results.length - sent;

  // Update notification status
  if (sent > 0) {
    await prisma.alertNotification.update({
      where: { id: notification.id },
      data: {
        pushSent: true,
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  return { success: sent > 0, sent, failed };
}

/**
 * Send pending notifications
 * @param {number} limit - Maximum notifications to process
 * @returns {Promise<Object>} Results summary
 */
export async function sendPendingNotifications(limit = 100) {
  const notifications = await prisma.alertNotification.findMany({
    where: {
      status: 'PENDING',
      pushSent: false,
    },
    include: {
      earthquake: true,
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
    take: limit,
  });

  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  for (const notification of notifications) {
    results.processed++;

    // Check if user has push enabled
    const preferences = await prisma.userAlertPreferences.findUnique({
      where: { id: notification.preferencesId },
    });

    if (!preferences?.pushEnabled) {
      results.skipped++;
      continue;
    }

    const result = await sendToUser(notification);

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
    }
  }

  return results;
}

/**
 * Generate VAPID keys (for setup)
 * Run: npx web-push generate-vapid-keys
 * @returns {Object} { publicKey, privateKey }
 */
export function generateVapidKeys() {
  return webpush.generateVAPIDKeys();
}

// Export service object
export const pushNotificationService = {
  isPushConfigured,
  getVapidPublicKey,
  sendPushNotification,
  sendToUser,
  sendPendingNotifications,
  generateVapidKeys,
};
