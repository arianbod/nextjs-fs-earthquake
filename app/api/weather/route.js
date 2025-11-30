'use server';

import { NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY; // Server-side only (no NEXT_PUBLIC_)
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { success: false, error: 'Missing lat/lon parameters' },
        { status: 400 }
      );
    }

    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'demo') {
      // Return fallback data if no API key
      return NextResponse.json({
        success: true,
        current: {
          temp: 20,
          humidity: 50,
          pressure: 1013,
          windSpeed: 5,
          rainfall: 0,
          description: 'Weather data unavailable',
        },
        rainfall: {
          total5Days: 10,
          avgDaily: 2,
          maxDaily: 5,
          rainyDays: 2,
          recentHeavyRain: false,
        },
        soilSaturationRisk: 'medium',
        analysis: {
          riskLevel: 'medium',
          description: 'Weather API not configured, using default values',
        },
      });
    }

    // Fetch current weather
    const currentResponse = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    let currentWeather = null;
    if (currentResponse.ok) {
      const data = await currentResponse.json();
      currentWeather = {
        temp: data.main?.temp || 20,
        humidity: data.main?.humidity || 50,
        pressure: data.main?.pressure || 1013,
        windSpeed: data.wind?.speed || 0,
        rainfall: data.rain?.['1h'] || 0,
        description: data.weather?.[0]?.description || 'clear',
      };
    }

    // Fetch 5-day forecast for rainfall data
    const forecastResponse = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    let rainfallData = {
      total5Days: 10,
      avgDaily: 2,
      maxDaily: 5,
      rainyDays: 2,
      recentHeavyRain: false,
    };

    if (forecastResponse.ok) {
      const data = await forecastResponse.json();
      let totalRainfall = 0;
      let rainyDays = 0;
      let maxDailyRain = 0;
      const dailyRain = {};

      data.list?.forEach((item) => {
        const date = new Date(item.dt * 1000).toDateString();
        const rain = item.rain?.['3h'] || 0;

        if (!dailyRain[date]) {
          dailyRain[date] = 0;
        }
        dailyRain[date] += rain;
        totalRainfall += rain;
      });

      Object.values(dailyRain).forEach((dayRain) => {
        if (dayRain > 0) rainyDays++;
        if (dayRain > maxDailyRain) maxDailyRain = dayRain;
      });

      const avgDailyRain = totalRainfall / Math.max(Object.keys(dailyRain).length, 1);

      rainfallData = {
        total5Days: Math.round(totalRainfall),
        avgDaily: Math.round(avgDailyRain),
        maxDaily: Math.round(maxDailyRain),
        rainyDays,
        recentHeavyRain: maxDailyRain > 50,
      };
    }

    // Calculate soil saturation risk
    let riskScore = 0;
    if (rainfallData.recentHeavyRain) riskScore += 40;
    if (rainfallData.total5Days > 100) riskScore += 30;
    else if (rainfallData.total5Days > 50) riskScore += 20;
    else if (rainfallData.total5Days > 25) riskScore += 10;
    if (rainfallData.maxDaily > 75) riskScore += 30;
    else if (rainfallData.maxDaily > 40) riskScore += 20;
    else if (rainfallData.maxDaily > 20) riskScore += 10;

    let soilSaturationRisk = 'medium';
    if (riskScore >= 70) soilSaturationRisk = 'very-high';
    else if (riskScore >= 50) soilSaturationRisk = 'high';
    else if (riskScore >= 30) soilSaturationRisk = 'medium';
    else if (riskScore >= 15) soilSaturationRisk = 'low';
    else soilSaturationRisk = 'very-low';

    return NextResponse.json({
      success: true,
      current: currentWeather || {
        temp: 20,
        humidity: 50,
        pressure: 1013,
        windSpeed: 5,
        rainfall: 0,
        description: 'clear',
      },
      rainfall: rainfallData,
      soilSaturationRisk,
      analysis: {
        riskLevel: soilSaturationRisk,
        description: getAnalysisDescription(soilSaturationRisk),
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weather data',
        current: {
          temp: 20,
          humidity: 50,
          pressure: 1013,
          windSpeed: 5,
          rainfall: 0,
          description: 'Error fetching weather',
        },
        rainfall: { total5Days: 10 },
        soilSaturationRisk: 'medium',
      },
      { status: 500 }
    );
  }
}

function getAnalysisDescription(riskLevel) {
  const descriptions = {
    'very-high': 'Heavy recent rainfall has saturated the soil, increasing liquefaction risk.',
    high: 'High soil moisture may affect foundation stability during seismic events.',
    medium: 'Normal rainfall patterns maintain typical soil conditions.',
    low: 'Dry conditions may reduce liquefaction risk.',
    'very-low': 'Extended dry period has reduced soil moisture significantly.',
  };
  return descriptions[riskLevel] || descriptions.medium;
}
