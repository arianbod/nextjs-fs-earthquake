// Google Elevation API Service
// Analyzes terrain slope and elevation for earthquake risk assessment

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Get elevation data and calculate slope around a building
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Elevation and slope analysis
 */
export async function getElevationAnalysis(lat, lon) {
  try {
    // Get elevation at the building location
    const centerElevation = await getElevation(lat, lon);
    
    // Get elevation points in a 100m radius (8 points)
    const surroundingPoints = await getSurroundingElevations(lat, lon, 100);
    
    // Calculate slope
    const slopeAnalysis = calculateSlope(centerElevation, surroundingPoints);
    
    // Analyze landslide risk based on slope
    const landslideRisk = analyzeLandslideRisk(slopeAnalysis);
    
    return {
      success: true,
      centerElevation: centerElevation,
      surroundingElevations: surroundingPoints,
      slopeAnalysis: slopeAnalysis,
      landslideRisk: landslideRisk,
      terrainType: classifyTerrain(slopeAnalysis)
    };
  } catch (error) {
    console.error('Elevation service error:', error);
    return {
      success: false,
      error: error.message,
      centerElevation: 0,
      slopeAnalysis: {
        maxSlope: 0,
        avgSlope: 0,
        direction: 'flat'
      },
      landslideRisk: 'low',
      terrainType: 'flat'
    };
  }
}

/**
 * Get elevation at a specific point
 */
async function getElevation(lat, lon) {
  try {
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Elevation API error');
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return {
        elevation: Math.round(data.results[0].elevation),
        resolution: Math.round(data.results[0].resolution),
        location: data.results[0].location
      };
    }
    
    throw new Error('No elevation data available');
  } catch (error) {
    console.error('Error fetching elevation:', error);
    return { elevation: 0, resolution: 0 };
  }
}

/**
 * Get elevation points around a center location
 */
async function getSurroundingElevations(lat, lon, radiusMeters) {
  const points = [];
  const numPoints = 8; // Get 8 points around the center
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (360 / numPoints) * i;
    const radians = (angle * Math.PI) / 180;
    
    // Calculate offset in meters and convert to degrees
    const latOffset = (radiusMeters / 111000) * Math.cos(radians); // 111km per degree latitude
    const lonOffset = (radiusMeters / (111000 * Math.cos(lat * Math.PI / 180))) * Math.sin(radians);
    
    const pointLat = lat + latOffset;
    const pointLon = lon + lonOffset;
    
    points.push(`${pointLat},${pointLon}`);
  }
  
  try {
    // Google Elevation API accepts multiple locations in one request
    const locations = points.join('|');
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Elevation API error');
    }
    
    const data = await response.json();
    
    if (data.results) {
      return data.results.map((result, index) => ({
        elevation: Math.round(result.elevation),
        direction: index * 45, // degrees
        distance: radiusMeters
      }));
    }
    
    throw new Error('No elevation data available');
  } catch (error) {
    console.error('Error fetching surrounding elevations:', error);
    // Return flat terrain as fallback
    return Array(numPoints).fill({ elevation: 0, direction: 0, distance: radiusMeters });
  }
}

/**
 * Calculate slope from elevation data
 */
function calculateSlope(center, surroundingPoints) {
  if (!center || !surroundingPoints || surroundingPoints.length === 0) {
    return {
      maxSlope: 0,
      avgSlope: 0,
      direction: 'flat',
      slopePercentage: 0
    };
  }
  
  const centerElev = center.elevation;
  const slopes = [];
  let maxSlope = 0;
  let maxSlopeDirection = 0;
  
  surroundingPoints.forEach(point => {
    const elevDiff = point.elevation - centerElev;
    const distance = point.distance || 100;
    
    // Calculate slope in degrees
    const slopeDegrees = Math.atan(elevDiff / distance) * (180 / Math.PI);
    slopes.push(Math.abs(slopeDegrees));
    
    if (Math.abs(slopeDegrees) > Math.abs(maxSlope)) {
      maxSlope = slopeDegrees;
      maxSlopeDirection = point.direction;
    }
  });
  
  const avgSlope = slopes.reduce((a, b) => a + b, 0) / slopes.length;
  const slopePercentage = Math.tan(maxSlope * Math.PI / 180) * 100;
  
  return {
    maxSlope: Math.round(maxSlope * 10) / 10, // degrees
    avgSlope: Math.round(avgSlope * 10) / 10, // degrees
    direction: getDirectionName(maxSlopeDirection),
    slopePercentage: Math.round(Math.abs(slopePercentage)),
    elevationChange: Math.round(Math.abs(maxSlope * 100 / 90)) // rough estimate
  };
}

/**
 * Get compass direction name
 */
function getDirectionName(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Classify terrain based on slope
 */
function classifyTerrain(slopeAnalysis) {
  const maxSlope = Math.abs(slopeAnalysis.maxSlope);
  
  if (maxSlope < 2) return 'flat';
  if (maxSlope < 5) return 'gentle';
  if (maxSlope < 15) return 'moderate';
  if (maxSlope < 30) return 'steep';
  return 'very-steep';
}

/**
 * Analyze landslide risk based on slope
 */
function analyzeLandslideRisk(slopeAnalysis) {
  const maxSlope = Math.abs(slopeAnalysis.maxSlope);
  
  if (maxSlope < 5) {
    return {
      level: 'very-low',
      description: 'Flat to gentle terrain with minimal landslide risk',
      impact: 'Stable ground conditions during earthquakes',
      multiplier: 1.0
    };
  } else if (maxSlope < 15) {
    return {
      level: 'low',
      description: 'Moderate slope with low landslide potential',
      impact: 'Generally stable, minor risk during strong earthquakes',
      multiplier: 1.05
    };
  } else if (maxSlope < 25) {
    return {
      level: 'medium',
      description: 'Significant slope requiring attention',
      impact: 'Increased risk of slope failure during earthquakes',
      multiplier: 1.15
    };
  } else if (maxSlope < 35) {
    return {
      level: 'high',
      description: 'Steep slope with high landslide potential',
      impact: 'Significant risk of landslides during seismic events',
      multiplier: 1.25
    };
  } else {
    return {
      level: 'very-high',
      description: 'Very steep terrain with extreme landslide risk',
      impact: 'Critical landslide hazard during earthquakes',
      multiplier: 1.35
    };
  }
}

/**
 * Get elevation profile for visualization
 */
export async function getElevationProfile(path) {
  if (!path || path.length < 2) {
    return [];
  }
  
  try {
    // Convert path to encoded polyline if needed
    const pathString = path.map(p => `${p.lat},${p.lng}`).join('|');
    const samples = Math.min(path.length * 3, 512); // Max 512 samples
    
    const url = `https://maps.googleapis.com/maps/api/elevation/json?path=${pathString}&samples=${samples}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Elevation API error');
    }
    
    const data = await response.json();
    
    if (data.results) {
      return data.results.map((point, index) => ({
        distance: (index / (data.results.length - 1)) * 100, // percentage of path
        elevation: Math.round(point.elevation),
        location: point.location
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching elevation profile:', error);
    return [];
  }
}