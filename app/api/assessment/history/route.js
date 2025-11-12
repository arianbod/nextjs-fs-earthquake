/**
 * Assessment History API Endpoint
 * GET /api/assessment/history
 * Retrieves user's assessment history
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';

export async function GET(request) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch assessments
    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where: { userId },
        include: {
          location: true,
          buildingInfo: {
            select: {
              buildingName: true,
              buildingType: true,
              numberOfFloors: true,
              structuralSystem: true,
              constructionYear: true,
            }
          },
          safetyResult: {
            select: {
              overallScore: true,
              riskLevel: true,
              safetyRating: true,
            }
          },
          images: {
            select: {
              id: true,
              imageType: true,
              thumbnailData: true,
            },
            take: 1, // Just get one thumbnail for preview
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.assessment.count({ where: { userId } })
    ]);

    return NextResponse.json({
      success: true,
      assessments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    });

  } catch (error) {
    console.error('Error fetching assessment history:', error);

    return NextResponse.json({
      error: 'Failed to fetch assessment history',
      message: error.message,
    }, { status: 500 });
  }
}
