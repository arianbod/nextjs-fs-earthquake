/**
 * USGS (United States Geological Survey) API Client
 * Fallback/global source for earthquake data
 *
 * API Endpoint: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/
 * Method: GET
 * Response: GeoJSON earthquake data
 */

import { generateFingerprint } from '../deduplication';

const USGS_FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';
const USGS_QUERY_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

/**
 * Fetch recent earthquakes from USGS
 * Uses the query API to filter by region (Turkey and surrounding area)
 * @param {Date|null} since - Only fetch events after this time (default: last hour)
 * @returns {Promise<Array>} Normalized earthquake events
 */
export async function fetchUSGSEarthquakes(since = null) {
  const endDate = new Date();
  const startDate = since || new Date(Date.now() - 60 * 60 * 1000); // Last hour

  // Use FDSN query API for region filtering
  const params = new URLSearchParams({
    format: 'geojson',
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
    const response = await fetch(`${USGS_QUERY_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // USGS returns GeoJSON FeatureCollection
    const features = data.features || [];

    return features.map(normalizeUSGSEvent);
  } catch (error) {
    console.error('USGS API fetch error:', error);
    throw error;
  }
}

/**
 * Fetch all recent earthquakes globally (fallback)
 * Uses the pre-generated feed for speed
 * @returns {Promise<Array>} Normalized earthquake events
 */
export async function fetchUSGSGlobalFeed() {
  try {
    const response = await fetch(`${USGS_FEED_URL}/all_hour.geojson`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`USGS Feed error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const features = data.features || [];

    return features.map(normalizeUSGSEvent);
  } catch (error) {
    console.error('USGS Feed fetch error:', error);
    throw error;
  }
}

/**
 * Normalize USGS event to standard format
 * @param {Object} feature - Raw USGS GeoJSON feature
 * @returns {Object} Normalized event
 */
function normalizeUSGSEvent(feature) {
  const { properties, geometry, id } = feature;
  const [longitude, latitude, depth] = geometry.coordinates;
  const magnitude = parseFloat(properties.mag);
  const eventTime = new Date(properties.time);

  return {
    sourceId: id || properties.code,
    source: 'USGS',
    latitude,
    longitude,
    depth: depth || null,
    magnitude,
    magnitudeType: properties.magType || 'M',
    eventTime,
    location: properties.place || null,
    region: extractRegion(properties.place),
    country: extractCountry(properties.place),
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
 * Extract region from place string
 * @param {string} place - Place description (e.g., "10km NE of City, Turkey")
 * @returns {string|null}
 */
function extractRegion(place) {
  if (!place) return null;

  // USGS format: "distance direction of City, Country"
  const parts = place.split(' of ');
  if (parts.length > 1) {
    const locationParts = parts[1].split(',');
    return locationParts[0].trim();
  }

  return place;
}

/**
 * Extract country from place string
 * @param {string} place - Place description
 * @returns {string|null}
 */
function extractCountry(place) {
  if (!place) return null;

  const placeLower = place.toLowerCase();
  if (placeLower.includes('turkey') || placeLower.includes('turkiye')) return 'Turkey';
  if (placeLower.includes('greece')) return 'Greece';
  if (placeLower.includes('iran')) return 'Iran';
  if (placeLower.includes('syria')) return 'Syria';
  if (placeLower.includes('cyprus')) return 'Cyprus';

  // Try to extract from comma-separated format
  const parts = place.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }

  return null;
}

/**
 * Check if USGS API is healthy
 * @returns {Promise<boolean>}
 */
export async function checkUSGSHealth() {
  try {
    const response = await fetch(`${USGS_FEED_URL}/all_hour.geojson`, {
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

export const usgsClient = {
  fetchRecentEvents: fetchUSGSEarthquakes,
  fetchGlobalFeed: fetchUSGSGlobalFeed,
  checkHealth: checkUSGSHealth,
  source: 'USGS',
};
