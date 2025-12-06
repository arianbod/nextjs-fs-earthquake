/**
 * Event Processor - Matches earthquakes to users and generates notifications
 *
 * Features:
 * - Matches earthquakes to user assessment locations
 * - Applies user preference filters (magnitude, distance, quiet hours)
 * - Generates notification records with priority levels
 * - Respects cooldown and daily limits
 */

import prisma from '@/lib/db/prisma';
import { calculateDistance } from './deduplication';
import { earthquakePoller } from './earthquakePoller';

/**
 * Event Processor Class
 */
class EventProcessor {
  /**
   * Process all unprocessed earthquake events
   * @returns {Promise<Array>} Generated notifications
   */
  async processNewEvents() {
    const events = await earthquakePoller.getUnprocessedEarthquakes();
    const notifications = [];

    for (const event of events) {
      try {
        const generated = await this.processEvent(event);
        notifications.push(...generated);

        // Mark as processed
        await earthquakePoller.markAsProcessed([event.id]);
      } catch (error) {
        console.error(`Failed to process event ${event.id}:`, error);
      }
    }

    return notifications;
  }

  /**
   * Process a single earthquake event
   * @param {Object} event - Earthquake event
   * @returns {Promise<Array>} Generated notifications for this event
   */
  async processEvent(event) {
    // Get all users with alerts enabled
    const usersWithLocations = await this.getUsersWithLocations();
    const notifications = [];

    for (const user of usersWithLocations) {
      try {
        const result = await this.shouldNotifyUser(user, event);

        if (result.notify) {
          const notification = await this.createNotification(user, event, result);
          notifications.push(notification);
        }
      } catch (error) {
        console.error(`Failed to check notification for user ${user.userId}:`, error);
      }
    }

    return notifications;
  }

  /**
   * Get all users with alerts enabled and their assessment locations
   * @returns {Promise<Array>}
   */
  async getUsersWithLocations() {
    const preferences = await prisma.userAlertPreferences.findMany({
      where: { alertsEnabled: true },
    });

    const usersWithLocations = await Promise.all(
      preferences.map(async (pref) => {
        // Get user's assessment locations
        const assessments = await prisma.assessment.findMany({
          where: { userId: pref.userId },
          include: {
            location: {
              select: {
                latitude: true,
                longitude: true,
                fullAddress: true,
                city: true,
              },
            },
          },
        });

        return {
          ...pref,
          locations: assessments
            .filter((a) => a.location?.latitude && a.location?.longitude)
            .map((a) => ({
              assessmentId: a.id,
              latitude: a.location.latitude,
              longitude: a.location.longitude,
              name: a.location.fullAddress || a.location.city || 'Assessment Location',
            })),
        };
      })
    );

    // Filter out users with no locations
    return usersWithLocations.filter((u) => u.locations.length > 0);
  }

  /**
   * Determine if a user should be notified for this earthquake
   * @param {Object} user - User with preferences and locations
   * @param {Object} event - Earthquake event
   * @returns {Promise<Object>} { notify: boolean, reason?: string, ... }
   */
  async shouldNotifyUser(user, event) {
    // Check magnitude threshold
    if (event.magnitude < user.minMagnitude) {
      return { notify: false, reason: 'below_magnitude_threshold' };
    }

    // Find closest location
    let closestLocation = null;
    let minDistance = Infinity;

    for (const loc of user.locations) {
      const distance = calculateDistance(
        event.latitude,
        event.longitude,
        loc.latitude,
        loc.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = loc;
      }
    }

    const isCritical = event.magnitude >= user.criticalMagnitude;

    // Check distance threshold (unless critical)
    if (!isCritical && minDistance > user.maxDistanceKm) {
      return { notify: false, reason: 'too_far' };
    }

    // Check quiet hours (skip for critical)
    if (!isCritical && user.quietHoursEnabled) {
      const inQuietHours = this.isInQuietHours(
        user.quietHoursStart,
        user.quietHoursEnd
      );
      if (inQuietHours) {
        return { notify: false, reason: 'quiet_hours' };
      }
    }

    // Check cooldown (skip for critical)
    if (!isCritical) {
      const recentNotification = await prisma.alertNotification.findFirst({
        where: {
          userId: user.userId,
          createdAt: {
            gte: new Date(Date.now() - user.cooldownMinutes * 60 * 1000),
          },
        },
      });

      if (recentNotification) {
        return { notify: false, reason: 'cooldown' };
      }
    }

    // Check daily limit (skip for critical)
    if (!isCritical) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayCount = await prisma.alertNotification.count({
        where: {
          userId: user.userId,
          createdAt: { gte: todayStart },
        },
      });

      if (todayCount >= user.dailyLimit) {
        return { notify: false, reason: 'daily_limit' };
      }
    }

    return {
      notify: true,
      distance: minDistance,
      location: closestLocation,
      isCritical,
    };
  }

  /**
   * Create a notification record
   * @param {Object} user - User preferences
   * @param {Object} event - Earthquake event
   * @param {Object} context - Notification context
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(user, event, context) {
    const priority = this.determinePriority(event.magnitude, context.isCritical);
    const { title, body } = this.generateNotificationContent(event, context, user.language);

    return prisma.alertNotification.create({
      data: {
        userId: user.userId,
        preferencesId: user.id,
        earthquakeId: event.id,
        title,
        body,
        priority,
        distanceKm: context.distance,
        relevantLocationId: context.location?.assessmentId,
        relevantLocationName: context.location?.name,
        status: 'PENDING',
      },
    });
  }

  /**
   * Determine notification priority based on magnitude
   * @param {number} magnitude - Earthquake magnitude
   * @param {boolean} isCritical - Is this a critical alert
   * @returns {string} Priority level
   */
  determinePriority(magnitude, isCritical) {
    if (isCritical || magnitude >= 5.0) return 'CRITICAL';
    if (magnitude >= 4.5) return 'HIGH';
    if (magnitude >= 4.0) return 'NORMAL';
    return 'LOW';
  }

  /**
   * Generate notification title and body
   * @param {Object} event - Earthquake event
   * @param {Object} context - Notification context
   * @param {string} language - User language (tr/en)
   * @returns {Object} { title, body }
   */
  generateNotificationContent(event, context, language) {
    const distance = Math.round(context.distance);
    const mag = event.magnitude.toFixed(1);
    const location = event.location || event.region || 'Unknown';

    if (language === 'tr') {
      return {
        title: context.isCritical
          ? `KRITIK DEPREM UYARISI: M${mag}`
          : `Deprem Uyarisi: M${mag}`,
        body: `${location} yakininda ${mag} buyuklugunde deprem. Konumunuza ${distance} km uzaklikta.`,
      };
    }

    return {
      title: context.isCritical
        ? `CRITICAL EARTHQUAKE ALERT: M${mag}`
        : `Earthquake Alert: M${mag}`,
      body: `M${mag} earthquake near ${location}. ${distance} km from your location.`,
    };
  }

  /**
   * Check if current time is within quiet hours
   * @param {string} start - Start time (HH:MM)
   * @param {string} end - End time (HH:MM)
   * @returns {boolean}
   */
  isInQuietHours(start, end) {
    if (!start || !end) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes <= endMinutes) {
      // Same day range (e.g., 09:00 - 17:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight range (e.g., 22:00 - 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }

  /**
   * Get pending notifications for delivery
   * @returns {Promise<Array>}
   */
  async getPendingNotifications() {
    return prisma.alertNotification.findMany({
      where: { status: 'PENDING' },
      include: {
        earthquake: true,
        preferences: {
          include: {
            subscriptions: {
              where: { active: true },
            },
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * Update notification status
   * @param {string} id - Notification ID
   * @param {Object} data - Update data
   */
  async updateNotificationStatus(id, data) {
    return prisma.alertNotification.update({
      where: { id },
      data,
    });
  }

  /**
   * Mark notification as sent
   * @param {string} id - Notification ID
   * @param {Object} channels - Channels used { push: boolean, email: boolean }
   */
  async markAsSent(id, channels = {}) {
    return this.updateNotificationStatus(id, {
      status: 'SENT',
      sentAt: new Date(),
      pushSent: channels.push || false,
      emailSent: channels.email || false,
    });
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   */
  async markAsRead(id) {
    return this.updateNotificationStatus(id, {
      status: 'READ',
      readAt: new Date(),
    });
  }
}

// Export singleton instance
export const eventProcessor = new EventProcessor();
