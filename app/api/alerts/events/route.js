/**
 * GET /api/alerts/events - Get recent earthquakes
 *
 * Query parameters:
 * - hours: number (default: 24)
 * - minMagnitude: number (default: 0)
 * - limit: number (default: 100)
 * - offset: number (default: 0)
 * - lat: number (optional, for distance filtering)
 * - lng: number (optional, for distance filtering)
 * - radius: number (optional, km)
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { earthquakePoller, calculateDistance } from '@/lib/alerts';

export async function GET(request) {
  try {
    // Authentication is optional for viewing earthquakes
    const { userId } = await auth();

    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const minMagnitude = parseFloat(searchParams.get('minMagnitude') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Optional location filtering
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')) : null;
    const radius = parseFloat(searchParams.get('radius') || '500');

    let earthquakes;

    if (lat && lng) {
      // Get earthquakes near location
      earthquakes = await earthquakePoller.getEarthquakesNearLocation(
        lat,
        lng,
        radius,
        hours
      );

      // Add distance to each earthquake
      earthquakes = earthquakes.map((eq) => ({
        ...eq,
        distanceKm: calculateDistance(lat, lng, eq.latitude, eq.longitude),
      }));

      // Sort by distance
      earthquakes.sort((a, b) => a.distanceKm - b.distanceKm);

      // Apply limit and offset
      earthquakes = earthquakes.slice(offset, offset + limit);
    } else {
      // Get all recent earthquakes
      earthquakes = await earthquakePoller.getRecentEarthquakes({
        hours,
        minMagnitude,
        limit,
        offset,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        earthquakes,
        count: earthquakes.length,
        filters: {
          hours,
          minMagnitude,
          limit,
          offset,
          lat,
          lng,
          radius: lat && lng ? radius : null,
        },
      },
    });
  } catch (error) {
    console.error('Get earthquakes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get earthquakes' },
      { status: 500 }
    );
  }
}
