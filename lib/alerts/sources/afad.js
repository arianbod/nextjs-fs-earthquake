/**
 * AFAD (Turkish Disaster and Emergency Management Authority) API Client
 * Primary source for Turkey earthquake data
 *
 * API Endpoint: https://deprem.afad.gov.tr/EventData/GetEventsByFilter
 * Method: POST
 * Response: Near real-time earthquake data for Turkey
 */

import { generateFingerprint } from '../deduplication';

const AFAD_API_URL = 'https://deprem.afad.gov.tr/EventData/GetEventsByFilter';

/**
 * Fetch recent earthquakes from AFAD
 * @param {Date|null} since - Only fetch events after this time (default: last hour)
 * @returns {Promise<Array>} Normalized earthquake events
 */
export async function fetchAFADEarthquakes(since = null) {
  const endDate = new Date();
  const startDate = since || new Date(Date.now() - 60 * 60 * 1000); // Last hour

  const body = {
    EventSearchFilterList: [
      { FilterType: 8, Value: startDate.toISOString() }, // Start date
      { FilterType: 9, Value: endDate.toISOString() },   // End date
    ],
    Skip: 0,
    Take: 100,
    SortDescriptor: { field: 'eventDate', dir: 'desc' }
  };

  try {
    const response = await fetch(AFAD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`AFAD API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // AFAD returns array directly or nested in eventList
    const events = Array.isArray(data) ? data : (data.eventList || []);

    return events.map(normalizeAFADEvent);
  } catch (error) {
    console.error('AFAD API fetch error:', error);
    throw error;
  }
}

/**
 * Normalize AFAD event to standard format
 * @param {Object} event - Raw AFAD event
 * @returns {Object} Normalized event
 */
function normalizeAFADEvent(event) {
  const latitude = parseFloat(event.latitude || event.lat);
  const longitude = parseFloat(event.longitude || event.lng);
  const magnitude = parseFloat(event.magnitude || event.mag);
  const eventTime = new Date(event.eventDate || event.date);

  return {
    sourceId: String(event.eventID || event.id),
    source: 'AFAD',
    latitude,
    longitude,
    depth: event.depth ? parseFloat(event.depth) : null,
    magnitude,
    magnitudeType: event.magnitudeType || event.magType || 'ML',
    eventTime,
    location: event.location || event.title || null,
    region: event.province || event.city || null,
    country: 'Turkey',
    rawData: event,
    fingerprint: generateFingerprint({
      latitude,
      longitude,
      magnitude,
      eventTime,
    }),
  };
}

/**
 * Check if AFAD API is healthy
 * @returns {Promise<boolean>}
 */
export async function checkAFADHealth() {
  try {
    const testBody = {
      EventSearchFilterList: [
        { FilterType: 8, Value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { FilterType: 9, Value: new Date().toISOString() },
      ],
      Skip: 0,
      Take: 1,
    };

    const response = await fetch(AFAD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testBody),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export const afadClient = {
  fetchRecentEvents: fetchAFADEarthquakes,
  checkHealth: checkAFADHealth,
  source: 'AFAD',
};
