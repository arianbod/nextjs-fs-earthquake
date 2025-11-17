/**
 * API Parameters Endpoint
 * GET /api/v1/parameters
 * Returns valid parameter values for building assessments
 */

import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@/lib/api/errorHandler';
import { CALCULATION_CONFIG } from '@/config/earthquakeParameters';
import { requirePlatformAuth } from '@/middleware/platformAuthMiddleware';

/**
 * GET /api/v1/parameters
 * Protected endpoint - requires platform authentication
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       buildingTypes: { ... },
 *       designRegulations: [ ... ],
 *       soilTypes: { ... },
 *       earthquakeZones: { ... },
 *       structuralSystems: [ ... ]
 *     }
 *   }
 */
export const GET = requirePlatformAuth(async function(request) {
  try {
    const parameters = {
      // Building structural systems
      structuralSystems: [
        {
          category: 'Wood Frame',
          types: [
            { code: 'W1', description: 'Wood, Light Frame (≤ 5,000 sq ft)', baseScore: 65 },
            { code: 'W1A', description: 'Wood, Light Frame (Multi-unit)', baseScore: 65 },
            { code: 'W2', description: 'Wood, Commercial and Industrial', baseScore: 60 }
          ]
        },
        {
          category: 'Steel',
          types: [
            { code: 'S1', description: 'Steel Moment Frame', baseScore: 75 },
            { code: 'S1M', description: 'Steel Moment Frame (Mid-rise)', baseScore: 73 },
            { code: 'S1H', description: 'Steel Moment Frame (High-rise)', baseScore: 70 },
            { code: 'S2', description: 'Steel Braced Frame', baseScore: 78 },
            { code: 'S2M', description: 'Steel Braced Frame (Mid-rise)', baseScore: 76 },
            { code: 'S2H', description: 'Steel Braced Frame (High-rise)', baseScore: 73 },
            { code: 'S3', description: 'Steel Light Frame', baseScore: 65 },
            { code: 'S4', description: 'Steel Frame with Cast-in-Place Concrete Shear Walls', baseScore: 80 },
            { code: 'S5', description: 'Steel Frame with Unreinforced Masonry', baseScore: 50 }
          ]
        },
        {
          category: 'Concrete',
          types: [
            { code: 'C1', description: 'Concrete Moment Frame', baseScore: 70 },
            { code: 'C1M', description: 'Concrete Moment Frame (Mid-rise)', baseScore: 68 },
            { code: 'C1H', description: 'Concrete Moment Frame (High-rise)', baseScore: 65 },
            { code: 'C2', description: 'Concrete Shear Walls', baseScore: 85 },
            { code: 'C2M', description: 'Concrete Shear Walls (Mid-rise)', baseScore: 83 },
            { code: 'C2H', description: 'Concrete Shear Walls (High-rise)', baseScore: 80 },
            { code: 'C3', description: 'Concrete Frame with Unreinforced Masonry', baseScore: 45 }
          ]
        },
        {
          category: 'Precast Concrete',
          types: [
            { code: 'PC1', description: 'Precast Concrete Tilt-Up Walls', baseScore: 60 },
            { code: 'PC2', description: 'Precast Concrete Frames', baseScore: 55 }
          ]
        },
        {
          category: 'Masonry',
          types: [
            { code: 'RM1', description: 'Reinforced Masonry Bearing Walls with Wood/Metal Deck', baseScore: 65 },
            { code: 'RM2', description: 'Reinforced Masonry Bearing Walls with Precast Concrete', baseScore: 68 },
            { code: 'URM', description: 'Unreinforced Masonry Bearing Walls', baseScore: 35 }
          ]
        },
        {
          category: 'Other',
          types: [
            { code: 'MH', description: 'Mobile Homes', baseScore: 40 }
          ]
        }
      ],

      // Design regulations / Building codes
      designRegulations: [
        {
          code: 'Before 1975',
          description: 'Pre-modern seismic codes',
          score: 40,
          riskLevel: 'high'
        },
        {
          code: '1975-1998',
          description: 'Early seismic design standards',
          score: 60,
          riskLevel: 'moderate-high'
        },
        {
          code: '1998-2007',
          description: 'Improved seismic provisions',
          score: 75,
          riskLevel: 'moderate'
        },
        {
          code: '2007-2018',
          description: 'Modern Turkish Earthquake Code',
          score: 85,
          riskLevel: 'low-moderate'
        },
        {
          code: 'After 2018 (TBDY)',
          description: 'Current TBDY-2018 Standards',
          score: 95,
          riskLevel: 'low'
        }
      ],

      // Soil types
      soilTypes: [
        {
          code: 'ZA',
          description: 'Hard Rock',
          modifier: 15,
          characteristics: 'Vs30 > 1500 m/s'
        },
        {
          code: 'ZB',
          description: 'Rock',
          modifier: 10,
          characteristics: '760 < Vs30 ≤ 1500 m/s'
        },
        {
          code: 'ZC',
          description: 'Very Dense Soil and Soft Rock',
          modifier: 0,
          characteristics: '360 < Vs30 ≤ 760 m/s'
        },
        {
          code: 'ZD',
          description: 'Stiff Soil',
          modifier: -10,
          characteristics: '180 < Vs30 ≤ 360 m/s'
        },
        {
          code: 'ZE',
          description: 'Soft Soil',
          modifier: -15,
          characteristics: 'Vs30 ≤ 180 m/s'
        }
      ],

      // Earthquake zones
      earthquakeZones: [
        {
          code: 'Zone 1',
          description: 'Low Seismic Activity',
          factor: 10,
          pga: '< 0.10g',
          riskLevel: 'low'
        },
        {
          code: 'Zone 2',
          description: 'Moderate Seismic Activity',
          factor: 0,
          pga: '0.10g - 0.20g',
          riskLevel: 'moderate'
        },
        {
          code: 'Zone 3',
          description: 'High Seismic Activity',
          factor: -10,
          pga: '0.20g - 0.30g',
          riskLevel: 'high'
        },
        {
          code: 'Zone 4',
          description: 'Very High Seismic Activity',
          factor: -15,
          pga: '> 0.30g',
          riskLevel: 'very_high'
        }
      ],

      // Irregularity types
      irregularities: {
        vertical: {
          high: {
            penalty: -15,
            description: 'Severe vertical irregularity (soft story, mass irregularity)'
          },
          moderate: {
            penalty: -8,
            description: 'Moderate vertical irregularity (setbacks, geometry changes)'
          }
        },
        plan: {
          penalty: -10,
          description: 'Plan irregularity (torsion, re-entrant corners)'
        }
      },

      // Assessment options
      assessmentOptions: {
        includeAiAnalysis: {
          default: true,
          description: 'Include AI-powered image analysis of building photos and plans',
          requiresImages: true
        },
        includeLocationIntelligence: {
          default: true,
          description: 'Include geospatial data, nearby buildings, and location context'
        },
        includeWeatherRisk: {
          default: true,
          description: 'Include weather-based soil saturation risk analysis'
        },
        includeStreetView: {
          default: false,
          description: 'Include Google Street View imagery (if available)'
        }
      },

      // Rate limit tiers
      rateLimitTiers: {
        free: {
          requestsPerHour: 100,
          requestsPerDay: 1000,
          features: ['Basic assessment', 'Safety calculation', 'Seismic data']
        },
        pro: {
          requestsPerHour: 1000,
          requestsPerDay: 10000,
          features: ['All free features', 'AI analysis', 'Location intelligence', 'Weather risk']
        },
        enterprise: {
          requestsPerHour: 10000,
          requestsPerDay: 100000,
          features: ['All pro features', 'Priority support', 'Custom integrations', 'Dedicated infrastructure']
        }
      }
    };

    return createSuccessResponse(
      parameters,
      {
        version: 'v1.0.0',
        lastUpdated: '2025-09-15T00:00:00Z'
      }
    );
  } catch (error) {
    console.error('Parameters retrieval error:', error);
    throw error;
  }
});

// OPTIONS handler for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
