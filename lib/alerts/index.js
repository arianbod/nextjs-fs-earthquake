/**
 * Earthquake Alert System - Main Exports
 *
 * This module provides real-time earthquake monitoring and notifications
 * for QuakeWise users based on their assessment locations.
 */

export { earthquakePoller } from './earthquakePoller';
export { eventProcessor } from './eventProcessor';
export {
  generateFingerprint,
  deduplicateEvents,
  calculateDistance,
  areSameEarthquake,
} from './deduplication';

// API Clients
export { afadClient } from './sources/afad';
export { emscClient } from './sources/emsc';
export { usgsClient } from './sources/usgs';
