/**
 * GET /api/reminders/cron/check-due-assessments
 *
 * Vercel Cron Job endpoint for checking due reassessment reminders
 * Scheduled to run daily at 8 AM UTC via vercel.json
 *
 * This endpoint:
 * 1. Finds assessments that are due for reassessment
 * 2. Respects user preferences (frequency, quiet hours)
 * 3. Sends push notifications to eligible users
 * 4. Updates lastReminderSentAt to prevent duplicate notifications
 */

import { NextResponse } from 'next/server';
import { processReassessmentReminders } from '@/lib/reminders/reminderService';

// Vercel serverless config
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max

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
      console.warn('Unauthorized reassessment cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[Reassessment Cron] Starting daily check...');

    const results = await processReassessmentReminders();

    const duration = Date.now() - startTime;

    console.log(`[Reassessment Cron] Completed in ${duration}ms:`, {
      sent: results.sent,
      failed: results.failed,
      totalDue: results.totalDue,
    });

    return NextResponse.json({
      success: results.success,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results: {
        totalDue: results.totalDue,
        sent: results.sent,
        failed: results.failed,
        skipped: results.skipped,
      },
      // Don't expose details in production
      ...(process.env.NODE_ENV === 'development' && { details: results.details }),
    });
  } catch (error) {
    console.error('[Reassessment Cron] Error:', error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}
