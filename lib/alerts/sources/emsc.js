/**
 * EMSC (European-Mediterranean Seismological Centre) API Client
 * Secondary source for Europe and Mediterranean earthquake data
 *
 * API Endpoint: https://www.seismicportal.eu/fdsnws/event/1/query
 * Method: GET
 * Response: GeoJSON earthquake data
 */

import { generateFingerprint } from '../deduplication';

const EMSC_API_URL = 'https://www.seismicportal.eu/fdsnws/event/1/query';

/**
 * Fetch recent earthquakes from EMSC
 * @param {Date|null} since - Only fetch events after this time (default: last hour)
 * @returns {Promise<Array>} Normalized earthquake events
 */
export async function fetchEMSCEarthquakes(since = null) {
  const endDate = new Date();
  const startDate = since || new Date(Date.now() - 60 * 60 * 1000); // Last hour

  const params = new URLSearchParams({
    format: 'json',
    starttime: startDate.toISOString(),
    endtime: endDate.toISOString(),
    minmagnitude: '2.0',
    // Focus on Turkey and surrounding region
    minlatitude: '35.0',
    maxlatitude: '43.0',
    minlongitude: '25.0',
    maxlongitude: '45.0',
    limit: '100',
    orderby: 'time-desc',
  });

  try {
    const response = await fetch(`${EMSC_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`EMSC API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // EMSC returns GeoJSON FeatureCollection
    const features = data.features || [];

    return features.map(normalizeEMSCEvent);
  } catch (error) {
    console.error('EMSC API fetch error:', error);
    throw error;
  }
}

/**
 * Normalize EMSC event to standard format
 * @param {Object} feature - Raw EMSC GeoJSON feature
 * @returns {Object} Normalized event
 */
function normalizeEMSCEvent(feature) {
  const { properties, geometry } = feature;
  const [longitude, latitude, depth] = geometry.coordinates;
  const magnitude = parseFloat(properties.mag);
  const eventTime = new Date(properties.time);

  return {
    sourceId: properties.source_id || properties.unid || feature.id,
    source: 'EMSC',
    latitude,
    longitude,
    depth: depth || null,
    magnitude,
    magnitudeType: properties.magtype || 'M',
    eventTime,
    location: properties.flynn_region || properties.place || null,
    region: properties.flynn_region || null,
    country: extractCountry(properties.flynn_region),
    rawData: feature,
    fingerprint: generateFingerprint({
      latitude,
      longitude,
      magnitude,
      eventTime,
    }),
  };
}

/**
 * Extract country from region string
 * @param {string} region - Region description
 * @returns {string|null}
 */
function extractCountry(region) {
  if (!region) return null;

  const regionLower = region.toLowerCase();
  if (regionLower.includes('turkey') || regionLower.includes('turkiye')) return 'Turkey';
  if (regionLower.includes('greece')) return 'Greece';
  if (regionLower.includes('iran')) return 'Iran';
  if (regionLower.includes('syria')) return 'Syria';
  if (regionLower.includes('cyprus')) return 'Cyprus';
  if (regionLower.includes('bulgaria')) return 'Bulgaria';

  return null;
}

/**
 * Check if EMSC API is healthy
 * @returns {Promise<boolean>}
 */
export async function checkEMSCHealth() {
  try {
    const params = new URLSearchParams({
      format: 'json',
      starttime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endtime: new Date().toISOString(),
      limit: '1',
    });

    const response = await fetch(`${EMSC_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

export const emscClient = {
  fetchRecentEvents: fetchEMSCEarthquakes,
  checkHealth: checkEMSCHealth,
  source: 'EMSC',
};
