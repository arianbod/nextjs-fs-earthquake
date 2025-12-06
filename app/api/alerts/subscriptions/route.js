/**
 * POST /api/alerts/subscriptions - Subscribe to push notifications
 * DELETE /api/alerts/subscriptions - Unsubscribe from push notifications
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';

/**
 * POST - Subscribe to push notifications
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, subscription, deviceInfo } = body;

    // Validate subscription type
    if (!['WEB_PUSH', 'FCM'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      );
    }

    // Ensure user has alert preferences
    let preferences = await prisma.userAlertPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.userAlertPreferences.create({
        data: { userId },
      });
    }

    // Create or update subscription based on type
    if (type === 'WEB_PUSH') {
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return NextResponse.json(
          { error: 'Invalid Web Push subscription data' },
          { status: 400 }
        );
      }

      // Check if subscription already exists
      const existing = await prisma.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: subscription.endpoint,
        },
      });

      if (existing) {
        // Update existing subscription
        const updated = await prisma.pushSubscription.update({
          where: { id: existing.id },
          data: {
            active: true,
            p256dhKey: subscription.keys.p256dh,
            authKey: subscription.keys.auth,
            deviceName: deviceInfo?.deviceName,
            browser: deviceInfo?.browser,
            platform: deviceInfo?.platform || 'web',
            failureCount: 0,
          },
        });

        return NextResponse.json({
          success: true,
          subscription: updated,
          message: 'Subscription updated',
        });
      }

      // Create new subscription
      const created = await prisma.pushSubscription.create({
        data: {
          userId,
          preferencesId: preferences.id,
          type: 'WEB_PUSH',
          endpoint: subscription.endpoint,
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          deviceName: deviceInfo?.deviceName,
          browser: deviceInfo?.browser,
          platform: deviceInfo?.platform || 'web',
        },
      });

      // Enable push in preferences
      await prisma.userAlertPreferences.update({
        where: { userId },
        data: { pushEnabled: true },
      });

      return NextResponse.json({
        success: true,
        subscription: created,
        message: 'Subscription created',
      });
    }

    if (type === 'FCM') {
      if (!subscription?.token) {
        return NextResponse.json(
          { error: 'Invalid FCM token' },
          { status: 400 }
        );
      }

      // Check if token already exists
      const existing = await prisma.pushSubscription.findFirst({
        where: {
          userId,
          fcmToken: subscription.token,
        },
      });

      if (existing) {
        // Update existing subscription
        const updated = await prisma.pushSubscription.update({
          where: { id: existing.id },
          data: {
            active: true,
            deviceName: deviceInfo?.deviceName,
            browser: deviceInfo?.browser,
            platform: deviceInfo?.platform || 'android',
            failureCount: 0,
          },
        });

        return NextResponse.json({
          success: true,
          subscription: updated,
          message: 'Subscription updated',
        });
      }

      // Create new subscription
      const created = await prisma.pushSubscription.create({
        data: {
          userId,
          preferencesId: preferences.id,
          type: 'FCM',
          fcmToken: subscription.token,
          deviceName: deviceInfo?.deviceName,
          browser: deviceInfo?.browser,
          platform: deviceInfo?.platform || 'android',
        },
      });

      // Enable push in preferences
      await prisma.userAlertPreferences.update({
        where: { userId },
        data: { pushEnabled: true },
      });

      return NextResponse.json({
        success: true,
        subscription: created,
        message: 'Subscription created',
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Unsubscribe from push notifications
 */
export async function DELETE(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, endpoint, token } = body;

    let deleted = 0;

    if (subscriptionId) {
      // Delete specific subscription by ID
      await prisma.pushSubscription.deleteMany({
        where: {
          id: subscriptionId,
          userId, // Ensure user owns this subscription
        },
      });
      deleted = 1;
    } else if (endpoint) {
      // Delete by endpoint (Web Push)
      const result = await prisma.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint,
        },
      });
      deleted = result.count;
    } else if (token) {
      // Delete by FCM token
      const result = await prisma.pushSubscription.deleteMany({
        where: {
          userId,
          fcmToken: token,
        },
      });
      deleted = result.count;
    } else {
      return NextResponse.json(
        { error: 'Must provide subscriptionId, endpoint, or token' },
        { status: 400 }
      );
    }

    // Check if user has any remaining subscriptions
    const remaining = await prisma.pushSubscription.count({
      where: { userId, active: true },
    });

    if (remaining === 0) {
      // Disable push in preferences
      await prisma.userAlertPreferences.updateMany({
        where: { userId },
        data: { pushEnabled: false },
      });
    }

    return NextResponse.json({
      success: true,
      deleted,
      message: deleted > 0 ? 'Unsubscribed successfully' : 'Subscription not found',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
