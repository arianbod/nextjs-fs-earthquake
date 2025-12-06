/**
 * GET /api/alerts/cron/poll-earthquakes
 *
 * Vercel Cron Job endpoint for polling earthquake data
 * Scheduled to run every minute via vercel.json
 *
 * This endpoint:
 * 1. Polls AFAD, EMSC, and USGS for new earthquakes
 * 2. Stores new events in the database
 * 3. Processes events to generate notifications
 * 4. Sends push and email notifications
 */

import { NextResponse } from 'next/server';
import { earthquakePoller, eventProcessor } from '@/lib/alerts';
import { pushNotificationService } from '@/services/pushNotificationService';

// Vercel serverless config
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for Pro plan

/**
 * GET - Cron job endpoint (secured by CRON_SECRET)
 */
export async function GET(request) {
  const startTime = Date.now();

  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Allow access if no secret is configured (development) or if secret matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also check for Vercel's internal cron header
    const vercelCronHeader = request.headers.get('x-vercel-cron');
    if (!vercelCronHeader) {
      console.warn('Unauthorized cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    polling: {
      newEvents: 0,
      duplicates: 0,
      errors: [],
      stats: {},
    },
    notifications: {
      generated: 0,
      pending: 0,
    },
    duration: null,
  };

  try {
    // Step 1: Poll earthquake sources
    console.log('[Cron] Starting earthquake polling...');
    const pollResults = await earthquakePoller.poll();

    results.polling = {
      newEvents: pollResults.newEvents.length,
      duplicates: pollResults.duplicates,
      errors: pollResults.errors,
      stats: pollResults.stats,
    };

    console.log(`[Cron] Polling complete: ${pollResults.newEvents.length} new events`);

    // Step 2: Process new events and generate notifications
    if (pollResults.newEvents.length > 0) {
      console.log('[Cron] Processing new events for notifications...');
      const notifications = await eventProcessor.processNewEvents();

      results.notifications.generated = notifications.length;
      console.log(`[Cron] Generated ${notifications.length} notifications`);
    }

    // Step 3: Get pending notifications count
    const pendingNotifications = await eventProcessor.getPendingNotifications();
    results.notifications.pending = pendingNotifications.length;

    // Step 4: Send push notifications
    if (pendingNotifications.length > 0) {
      console.log(`[Cron] ${pendingNotifications.length} notifications pending delivery`);

      if (pushNotificationService.isPushConfigured()) {
        const pushResults = await pushNotificationService.sendPendingNotifications(50);
        results.notifications.pushSent = pushResults.sent;
        results.notifications.pushFailed = pushResults.failed;
        console.log(`[Cron] Push sent: ${pushResults.sent}, failed: ${pushResults.failed}`);
      } else {
        console.log('[Cron] Push notifications not configured - skipping');
      }
    }

    results.duration = `${Date.now() - startTime}ms`;

    console.log(`[Cron] Complete in ${results.duration}`);

    return NextResponse.json(results);
  } catch (error) {
    console.error('[Cron] Error:', error);

    results.success = false;
    results.error = error.message;
    results.duration = `${Date.now() - startTime}ms`;

    return NextResponse.json(results, { status: 500 });
  }
}

/**
 * POST - Manual trigger for testing (requires auth)
 */
export async function POST(request) {
  // Check for admin access or CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delegate to GET handler
  return GET(request);
}
