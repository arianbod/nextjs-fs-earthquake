/**
 * Reassessment Reminder Service
 *
 * Handles checking for due assessments and sending reminder notifications.
 * Integrates with the existing push notification infrastructure.
 */

import prisma from '@/lib/db/prisma';
import { sendPushNotification, isPushConfigured } from '@/services/pushNotificationService';

/**
 * Check if current time is within quiet hours for a user
 * @param {Object} preferences - User's alert preferences
 * @returns {boolean}
 */
function isQuietHours(preferences) {
  if (!preferences.quietHoursEnabled) return false;

  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMin] = (preferences.quietHoursStart || '22:00').split(':').map(Number);
  const [endHour, endMin] = (preferences.quietHoursEnd || '07:00').split(':').map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }

  return currentTime >= startTime && currentTime < endTime;
}

/**
 * Calculate the cutoff date for assessments that need reminders
 * @param {number} frequencyDays - Number of days between reminders
 * @returns {Date}
 */
function getCutoffDate(frequencyDays) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - frequencyDays);
  return cutoff;
}

/**
 * Get all assessments that are due for reassessment reminders
 * @returns {Promise<Array>} Array of assessments with user preferences
 */
export async function getDueAssessments() {
  // Get all users with reassessment reminders enabled
  const usersWithPreferences = await prisma.userAlertPreferences.findMany({
    where: {
      reassessmentRemindersEnabled: true,
      pushEnabled: true,
    },
    include: {
      subscriptions: {
        where: {
          active: true,
        },
      },
    },
  });

  const dueAssessments = [];

  for (const prefs of usersWithPreferences) {
    // Skip if in quiet hours
    if (isQuietHours(prefs)) {
      continue;
    }

    // Skip if no active push subscriptions
    if (prefs.subscriptions.length === 0) {
      continue;
    }

    const cutoffDate = getCutoffDate(prefs.reassessmentFrequencyDays);
    const reminderCooldown = new Date();
    reminderCooldown.setDate(reminderCooldown.getDate() - 30); // Don't send more than once per 30 days

    // Find assessments that are due for this user
    const assessments = await prisma.assessment.findMany({
      where: {
        userId: prefs.userId,
        status: 'COMPLETE',
        completedAt: {
          lt: cutoffDate,
        },
        OR: [
          { lastReminderSentAt: null },
          { lastReminderSentAt: { lt: reminderCooldown } },
        ],
      },
      include: {
        location: true,
        safetyResult: true,
      },
      orderBy: {
        completedAt: 'asc',
      },
      take: 5, // Limit to 5 assessments per user per day
    });

    for (const assessment of assessments) {
      dueAssessments.push({
        assessment,
        preferences: prefs,
        subscriptions: prefs.subscriptions,
      });
    }
  }

  return dueAssessments;
}

/**
 * Calculate days since assessment was completed
 * @param {Date} completedAt - Assessment completion date
 * @returns {number}
 */
function getDaysSinceCompletion(completedAt) {
  const now = new Date();
  const diff = now.getTime() - new Date(completedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get a short address for notification display
 * @param {Object} location - Assessment location
 * @returns {string}
 */
function getShortAddress(location) {
  if (!location) return 'your building';

  if (location.neighborhood && location.district) {
    return `${location.neighborhood}, ${location.district}`;
  }
  if (location.district) {
    return location.district;
  }
  if (location.fullAddress) {
    // Take first part of address
    return location.fullAddress.split(',')[0];
  }
  return 'your building';
}

/**
 * Send a reassessment reminder notification
 * @param {Object} assessment - The assessment to remind about
 * @param {Object} subscription - Push subscription to send to
 * @param {string} language - User's preferred language
 * @returns {Promise<Object>} Result with success status
 */
export async function sendReassessmentReminder(assessment, subscription, language = 'en') {
  const daysSince = getDaysSinceCompletion(assessment.completedAt);
  const shortAddress = getShortAddress(assessment.location);

  // Localized notification content
  const titles = {
    en: 'Reassessment Reminder',
    tr: 'Yeniden Değerlendirme Hatırlatıcısı',
  };

  const bodies = {
    en: `Your assessment for ${shortAddress} is ${daysSince} days old. Tap to reassess and keep your safety info current.`,
    tr: `${shortAddress} için değerlendirmeniz ${daysSince} gün önce yapıldı. Güvenlik bilgilerinizi güncel tutmak için yeniden değerlendirin.`,
  };

  const notification = {
    title: titles[language] || titles.en,
    body: bodies[language] || bodies.en,
    id: `reassessment-${assessment.id}`,
  };

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: '/images/logo-192.png',
    badge: '/images/badge-72.png',
    tag: `reassessment-${assessment.id}`,
    data: {
      type: 'reassessment_reminder',
      assessmentId: assessment.id,
      url: `/result/${assessment.id}?reassess=true`,
    },
    actions: [
      { action: 'reassess', title: language === 'tr' ? 'Yeniden Değerlendir' : 'Reassess Now' },
      { action: 'dismiss', title: language === 'tr' ? 'Kapat' : 'Dismiss' },
    ],
    requireInteraction: false,
    vibrate: [100, 50, 100],
  });

  try {
    const result = await sendPushNotification(subscription, {
      ...notification,
      payload,
    });
    return result;
  } catch (error) {
    console.error('Failed to send reassessment reminder:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process all due assessments and send reminders
 * @returns {Promise<Object>} Summary of sent notifications
 */
export async function processReassessmentReminders() {
  if (!isPushConfigured()) {
    return {
      success: false,
      error: 'Push notifications not configured',
      sent: 0,
      failed: 0,
      skipped: 0,
    };
  }

  const dueAssessments = await getDueAssessments();
  const results = {
    sent: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  for (const { assessment, preferences, subscriptions } of dueAssessments) {
    let sentForAssessment = false;

    for (const subscription of subscriptions) {
      try {
        const result = await sendReassessmentReminder(
          assessment,
          subscription,
          preferences.language
        );

        if (result.success) {
          results.sent++;
          sentForAssessment = true;
        } else {
          results.failed++;
        }

        results.details.push({
          assessmentId: assessment.id,
          subscriptionId: subscription.id,
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          assessmentId: assessment.id,
          subscriptionId: subscription.id,
          success: false,
          error: error.message,
        });
      }
    }

    // Update lastReminderSentAt if at least one notification was sent
    if (sentForAssessment) {
      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { lastReminderSentAt: new Date() },
      });
    }
  }

  return {
    success: true,
    ...results,
    totalDue: dueAssessments.length,
  };
}

/**
 * Check if an assessment is due for reassessment
 * @param {Object} assessment - The assessment to check
 * @param {number} frequencyDays - User's reminder frequency setting
 * @returns {boolean}
 */
export function isAssessmentDue(assessment, frequencyDays = 365) {
  if (!assessment.completedAt || assessment.status !== 'COMPLETE') {
    return false;
  }

  const daysSince = getDaysSinceCompletion(assessment.completedAt);
  return daysSince >= frequencyDays;
}

/**
 * Get days until next reassessment is due
 * @param {Object} assessment - The assessment to check
 * @param {number} frequencyDays - User's reminder frequency setting
 * @returns {number} Days until due (negative if overdue)
 */
export function getDaysUntilDue(assessment, frequencyDays = 365) {
  if (!assessment.completedAt) {
    return null;
  }

  const daysSince = getDaysSinceCompletion(assessment.completedAt);
  return frequencyDays - daysSince;
}
