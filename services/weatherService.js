// Weather Service for Soil Saturation Risk Analysis
// Heavy rainfall affects soil conditions and can increase earthquake damage

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get current and historical weather data for location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Weather analysis data
 */
export async function getWeatherAnalysis(lat, lon) {
  try {
    // Get current weather
    const currentWeather = await fetchCurrentWeather(lat, lon);
    
    // Get rainfall statistics (using 5 day forecast as proxy for recent rainfall)
    const rainfallData = await fetchRainfallData(lat, lon);
    
    // Analyze soil saturation risk
    const soilSaturationRisk = calculateSoilSaturationRisk(rainfallData);
    
    return {
      success: true,
      current: currentWeather,
      rainfall: rainfallData,
      soilSaturationRisk,
      analysis: generateWeatherAnalysis(currentWeather, rainfallData, soilSaturationRisk)
    };
  } catch (error) {
    console.error('Weather service error:', error);
    return {
      success: false,
      error: error.message,
      // Fallback data
      soilSaturationRisk: 'medium',
      analysis: {
        riskLevel: 'medium',
        description: 'Unable to fetch weather data, using average conditions'
      }
    };
  }
}

/**
 * Fetch current weather conditions
 */
async function fetchCurrentWeather(lat, lon) {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Weather API error');
    }
    
    const data = await response.json();
    
    return {
      temp: data.main?.temp || 20,
      humidity: data.main?.humidity || 50,
      pressure: data.main?.pressure || 1013,
      windSpeed: data.wind?.speed || 0,
      rainfall: data.rain?.['1h'] || 0, // mm in last hour
      description: data.weather?.[0]?.description || 'clear',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

/**
 * Fetch rainfall data (using 5 day forecast)
 */
async function fetchRainfallData(lat, lon) {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Forecast API error');
    }
    
    const data = await response.json();
    
    // Calculate rainfall statistics from forecast data
    let totalRainfall = 0;
    let rainyDays = 0;
    let maxDailyRain = 0;
    const dailyRain = {};
    
    data.list?.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      const rain = item.rain?.['3h'] || 0;
      
      if (!dailyRain[date]) {
        dailyRain[date] = 0;
      }
      dailyRain[date] += rain;
      totalRainfall += rain;
    });
    
    // Calculate statistics
    Object.values(dailyRain).forEach(dayRain => {
      if (dayRain > 0) rainyDays++;
      if (dayRain > maxDailyRain) maxDailyRain = dayRain;
    });
    
    const avgDailyRain = totalRainfall / Object.keys(dailyRain).length;
    
    return {
      total5Days: Math.round(totalRainfall),
      avgDaily: Math.round(avgDailyRain),
      maxDaily: Math.round(maxDailyRain),
      rainyDays: rainyDays,
      recentHeavyRain: maxDailyRain > 50, // More than 50mm is heavy rain
      monthlyEstimate: Math.round(avgDailyRain * 30) // Rough estimate
    };
  } catch (error) {
    console.error('Error fetching rainfall data:', error);
    return {
      total5Days: 10,
      avgDaily: 2,
      maxDaily: 5,
      rainyDays: 2,
      recentHeavyRain: false,
      monthlyEstimate: 60
    };
  }
}

/**
 * Calculate soil saturation risk based on rainfall
 */
function calculateSoilSaturationRisk(rainfallData) {
  if (!rainfallData) return 'medium';
  
  const { total5Days, maxDaily, recentHeavyRain, monthlyEstimate } = rainfallData;
  
  // Risk factors
  let riskScore = 0;
  
  // Recent heavy rain is most important
  if (recentHeavyRain) riskScore += 40;
  
  // Total recent rainfall
  if (total5Days > 100) riskScore += 30;
  else if (total5Days > 50) riskScore += 20;
  else if (total5Days > 25) riskScore += 10;
  
  // Maximum daily rainfall
  if (maxDaily > 75) riskScore += 30;
  else if (maxDaily > 40) riskScore += 20;
  else if (maxDaily > 20) riskScore += 10;
  
  // Determine risk level
  if (riskScore >= 70) return 'very-high';
  if (riskScore >= 50) return 'high';
  if (riskScore >= 30) return 'medium';
  if (riskScore >= 15) return 'low';
  return 'very-low';
}

/**
 * Generate weather-based analysis for earthquake risk
 */
function generateWeatherAnalysis(current, rainfall, riskLevel) {
  const analyses = {
    'very-high': {
      riskLevel: 'very-high',
      impact: 'Severe soil saturation significantly increases earthquake damage risk',
      description: 'Heavy recent rainfall has saturated the soil, which can amplify ground shaking and increase liquefaction risk during an earthquake.',
      recommendation: 'Consider temporary reinforcement measures during wet season',
      multiplier: 1.3 // 30% increase in risk
    },
    'high': {
      riskLevel: 'high',
      impact: 'High soil moisture increases earthquake vulnerability',
      description: 'Recent rainfall has increased soil moisture content, potentially affecting foundation stability during seismic events.',
      recommendation: 'Monitor drainage systems and foundation water accumulation',
      multiplier: 1.2 // 20% increase in risk
    },
    'medium': {
      riskLevel: 'medium',
      impact: 'Moderate soil moisture with standard earthquake risk',
      description: 'Normal rainfall patterns maintain typical soil conditions for your region.',
      recommendation: 'Maintain proper drainage around building foundation',
      multiplier: 1.1 // 10% increase in risk
    },
    'low': {
      riskLevel: 'low',
      impact: 'Low soil moisture reduces some earthquake risks',
      description: 'Dry soil conditions may reduce liquefaction risk but can affect soil cohesion.',
      recommendation: 'Standard earthquake preparedness measures apply',
      multiplier: 1.0 // No change
    },
    'very-low': {
      riskLevel: 'very-low',
      impact: 'Very dry conditions with minimal moisture-related risk',
      description: 'Extended dry period has reduced soil moisture content significantly.',
      recommendation: 'Monitor for soil shrinkage and foundation settling',
      multiplier: 0.95 // 5% decrease in some risks
    }
  };
  
  return analyses[riskLevel] || analyses['medium'];
}

/**
 * Get historical weather extremes (mock data for demo)
 * In production, this would query historical weather APIs
 */
export function getWeatherExtremes(lat, lon) {
  // This would normally query historical data
  // For demo purposes, return representative data
  return {
    annual: {
      maxRainfall: 250, // mm in 24 hours
      maxRainfallDate: 'March 2023',
      minRainfall: 0,
      avgRainfall: 45,
      maxWindSpeed: 85, // km/h
      maxWindDate: 'December 2023',
      wetSeason: 'December - March',
      drySeason: 'June - September'
    },
    recent: {
      last30Days: 120, // mm
      last90Days: 280, // mm
      heavyRainEvents: 3, // Number of days with >50mm
      lastHeavyRain: '5 days ago'
    },
    risk: {
      floodRisk: 'medium',
      landslideRisk: 'low',
      liquefactionRisk: 'medium-high'
    }
  };
}

/**
 * Calculate weather impact on earthquake safety score
 */
export function calculateWeatherImpact(weatherData, soilType) {
  if (!weatherData || !weatherData.success) {
    return {
      impactScore: 0,
      description: 'Weather data unavailable'
    };
  }
  
  const { soilSaturationRisk, analysis } = weatherData;
  const multiplier = analysis.multiplier || 1.0;
  
  // Soil type affects how much weather impacts safety
  const soilSensitivity = {
    'ZA': 0.2,  // Rock - least affected by water
    'ZB': 0.4,  // Very dense - slightly affected
    'ZC': 0.6,  // Dense - moderately affected
    'ZD': 0.8,  // Medium dense - highly affected
    'ZE': 1.0   // Soft - most affected by water
  };
  
  const sensitivity = soilSensitivity[soilType] || 0.6;
  const baseImpact = (multiplier - 1) * 100; // Convert to percentage
  const adjustedImpact = baseImpact * sensitivity;
  
  return {
    impactScore: adjustedImpact,
    multiplier: 1 + (adjustedImpact / 100),
    description: analysis.description,
    recommendation: analysis.recommendation,
    riskLevel: soilSaturationRisk
  };
}