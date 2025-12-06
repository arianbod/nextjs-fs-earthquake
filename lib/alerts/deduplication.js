/**
 * Earthquake Event Deduplication
 *
 * Multiple sources (AFAD, EMSC, USGS) often report the same earthquake.
 * This module generates unique fingerprints and deduplicates events.
 *
 * Fingerprint strategy:
 * - Round lat/lng to 1 decimal place (~10km accuracy)
 * - Round time to 10-second buckets
 * - Round magnitude to 0.1
 */

import crypto from 'crypto';

/**
 * Generate a unique fingerprint for an earthquake event
 * Used to identify the same earthquake across different sources
 *
 * @param {Object} event - Event with latitude, longitude, magnitude, eventTime
 * @returns {string} SHA-256 hash fingerprint
 */
export function generateFingerprint({ latitude, longitude, magnitude, eventTime }) {
  // Round values to reduce precision and match similar events
  const latBucket = Math.round(latitude * 10); // ~10km precision
  const lngBucket = Math.round(longitude * 10);
  const timeBucket = Math.round(new Date(eventTime).getTime() / 10000); // 10-second buckets
  const magBucket = Math.round(magnitude * 10); // 0.1 precision

  const fingerprint = `${latBucket}_${lngBucket}_${timeBucket}_${magBucket}`;

  return crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 32);
}

/**
 * Deduplicate events from multiple sources
 * Prefers AFAD > EMSC > USGS for Turkish earthquakes
 *
 * @param {Array} events - Array of normalized events from all sources
 * @returns {Array} Deduplicated events
 */
export function deduplicateEvents(events) {
  const fingerprints = new Map();

  // Priority order: AFAD (1), EMSC (2), USGS (3)
  const sourcePriority = {
    AFAD: 1,
    EMSC: 2,
    USGS: 3,
  };

  for (const event of events) {
    const existing = fingerprints.get(event.fingerprint);

    if (!existing) {
      fingerprints.set(event.fingerprint, event);
    } else {
      // Keep event from higher priority source (lower number)
      const existingPriority = sourcePriority[existing.source] || 99;
      const newPriority = sourcePriority[event.source] || 99;

      if (newPriority < existingPriority) {
        // Replace with higher priority source
        fingerprints.set(event.fingerprint, event);
      } else if (newPriority === existingPriority) {
        // Same source - keep the one with more complete data
        const merged = mergeEvents(existing, event);
        fingerprints.set(event.fingerprint, merged);
      }
    }
  }

  return Array.from(fingerprints.values());
}

/**
 * Merge two events from the same source
 * Prefer non-null values and most recent update
 *
 * @param {Object} event1 - First event
 * @param {Object} event2 - Second event
 * @returns {Object} Merged event
 */
function mergeEvents(event1, event2) {
  return {
    ...event1,
    location: event1.location || event2.location,
    region: event1.region || event2.region,
    depth: event1.depth ?? event2.depth,
    magnitudeType: event1.magnitudeType || event2.magnitudeType,
  };
}

/**
 * Check if two events are likely the same earthquake
 * Uses looser matching than fingerprinting for manual checks
 *
 * @param {Object} event1 - First event
 * @param {Object} event2 - Second event
 * @returns {boolean} True if events are likely duplicates
 */
export function areSameEarthquake(event1, event2) {
  // Time must be within 60 seconds
  const timeDiff = Math.abs(
    new Date(event1.eventTime).getTime() - new Date(event2.eventTime).getTime()
  );
  if (timeDiff > 60000) return false;

  // Location must be within ~50km
  const distance = calculateDistance(
    event1.latitude,
    event1.longitude,
    event2.latitude,
    event2.longitude
  );
  if (distance > 50) return false;

  // Magnitude must be within 0.5
  const magDiff = Math.abs(event1.magnitude - event2.magnitude);
  if (magDiff > 0.5) return false;

  return true;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 *
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}
