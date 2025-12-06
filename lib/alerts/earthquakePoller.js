/**
 * Earthquake Polling Service
 *
 * Aggregates earthquake data from multiple sources:
 * - AFAD (primary for Turkey)
 * - EMSC (secondary for Europe/Mediterranean)
 * - USGS (fallback/global)
 *
 * Features:
 * - Multi-source polling with deduplication
 * - Health tracking per source
 * - Stores new events to database
 */

import { afadClient } from './sources/afad';
import { emscClient } from './sources/emsc';
import { usgsClient } from './sources/usgs';
import { deduplicateEvents } from './deduplication';
import prisma from '@/lib/db/prisma';

/**
 * Earthquake Poller Class
 */
class EarthquakePoller {
  constructor() {
    this.sources = {
      AFAD: afadClient,
      EMSC: emscClient,
      USGS: usgsClient,
    };
  }

  /**
   * Poll all sources and store new events
   * @returns {Promise<Object>} Poll results
   */
  async poll() {
    const results = {
      newEvents: [],
      duplicates: 0,
      errors: [],
      stats: { AFAD: 0, EMSC: 0, USGS: 0 },
      startTime: new Date(),
      endTime: null,
    };

    // Get last poll times for each source
    const pollStatuses = await this.getLastPollStatuses();

    // Poll all sources in parallel
    const pollPromises = Object.entries(this.sources).map(async ([source, client]) => {
      const lastStatus = pollStatuses.find((s) => s.source === source);
      const since = lastStatus?.lastEventTime || new Date(Date.now() - 60 * 60 * 1000);

      try {
        const events = await client.fetchRecentEvents(since);
        results.stats[source] = events.length;

        await this.updatePollStatus(source, {
          success: true,
          eventsCount: events.length,
          lastEventTime: events.length > 0 ? events[0].eventTime : null,
        });

        return events;
      } catch (error) {
        results.errors.push({ source, error: error.message });

        await this.updatePollStatus(source, {
          success: false,
          error: error.message,
        });

        return [];
      }
    });

    const allEventsArrays = await Promise.all(pollPromises);
    const allEvents = allEventsArrays.flat();

    // Deduplicate across sources
    const uniqueEvents = deduplicateEvents(allEvents);
    results.duplicates = allEvents.length - uniqueEvents.length;

    // Store new events
    for (const event of uniqueEvents) {
      try {
        const existing = await prisma.earthquakeEvent.findUnique({
          where: { fingerprint: event.fingerprint },
        });

        if (!existing) {
          const created = await prisma.earthquakeEvent.create({
            data: {
              sourceId: event.sourceId,
              source: event.source,
              fingerprint: event.fingerprint,
              latitude: event.latitude,
              longitude: event.longitude,
              depth: event.depth,
              magnitude: event.magnitude,
              magnitudeType: event.magnitudeType,
              eventTime: event.eventTime,
              location: event.location,
              region: event.region,
              country: event.country,
              rawData: event.rawData,
            },
          });
          results.newEvents.push(created);
        }
      } catch (error) {
        console.error(`Failed to store event ${event.sourceId}:`, error);
      }
    }

    results.endTime = new Date();
    return results;
  }

  /**
   * Get last poll status for all sources
   * @returns {Promise<Array>}
   */
  async getLastPollStatuses() {
    try {
      return await prisma.earthquakePollingStatus.findMany();
    } catch {
      return [];
    }
  }

  /**
   * Update poll status for a source
   * @param {string} source - Source name
   * @param {Object} status - Status update
   */
  async updatePollStatus(source, { success, eventsCount = 0, lastEventTime = null, error = null }) {
    try {
      await prisma.earthquakePollingStatus.upsert({
        where: { source },
        update: {
          lastPollAt: new Date(),
          lastSuccessAt: success ? new Date() : undefined,
          lastEventTime: lastEventTime || undefined,
          eventsProcessed: success ? { increment: eventsCount } : undefined,
          errorCount: success ? 0 : { increment: 1 },
          lastError: error || null,
          isHealthy: success,
        },
        create: {
          source,
          lastPollAt: new Date(),
          lastSuccessAt: success ? new Date() : null,
          lastEventTime,
          eventsProcessed: eventsCount,
          errorCount: success ? 0 : 1,
          lastError: error || null,
          isHealthy: success,
        },
      });
    } catch (err) {
      console.error(`Failed to update poll status for ${source}:`, err);
    }
  }

  /**
   * Get health status for all sources
   * @returns {Promise<Object>}
   */
  async getHealthStatus() {
    const statuses = await this.getLastPollStatuses();

    const health = {
      overall: true,
      sources: {},
      lastCheck: new Date(),
    };

    for (const status of statuses) {
      health.sources[status.source] = {
        healthy: status.isHealthy,
        lastPoll: status.lastPollAt,
        lastSuccess: status.lastSuccessAt,
        errorCount: status.errorCount,
        lastError: status.lastError,
      };

      if (!status.isHealthy) {
        health.overall = false;
      }
    }

    return health;
  }

  /**
   * Get recent earthquakes from database
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getRecentEarthquakes({
    hours = 24,
    minMagnitude = 0,
    limit = 100,
    offset = 0,
  } = {}) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return prisma.earthquakeEvent.findMany({
      where: {
        eventTime: { gte: since },
        magnitude: { gte: minMagnitude },
      },
      orderBy: { eventTime: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get earthquakes near a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusKm - Radius in kilometers
   * @param {number} hours - Hours to look back
   * @returns {Promise<Array>}
   */
  async getEarthquakesNearLocation(lat, lng, radiusKm = 100, hours = 24) {
    // First get recent earthquakes
    const earthquakes = await this.getRecentEarthquakes({ hours, minMagnitude: 2 });

    // Filter by distance (in JavaScript since PostgreSQL earthdistance may not be available)
    const { calculateDistance } = await import('./deduplication');

    return earthquakes.filter((eq) => {
      const distance = calculateDistance(lat, lng, eq.latitude, eq.longitude);
      return distance <= radiusKm;
    });
  }

  /**
   * Get unprocessed earthquakes for notification processing
   * @returns {Promise<Array>}
   */
  async getUnprocessedEarthquakes() {
    return prisma.earthquakeEvent.findMany({
      where: { processed: false },
      orderBy: { eventTime: 'desc' },
    });
  }

  /**
   * Mark earthquakes as processed
   * @param {Array<string>} ids - Earthquake IDs
   */
  async markAsProcessed(ids) {
    await prisma.earthquakeEvent.updateMany({
      where: { id: { in: ids } },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  }
}

// Export singleton instance
export const earthquakePoller = new EarthquakePoller();
