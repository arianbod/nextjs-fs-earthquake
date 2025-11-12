/**
 * Get Assessment by ID API Endpoint
 * GET /api/assessment/[id]
 * Retrieves a specific assessment with all details
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch assessment with all related data
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        userId, // Ensure user can only access their own assessments
      },
      include: {
        location: true,
        buildingInfo: true,
        safetyResult: true,
        images: {
          orderBy: { uploadedAt: 'asc' }
        },
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment,
    });

  } catch (error) {
    console.error('Error fetching assessment:', error);

    return NextResponse.json({
      error: 'Failed to fetch assessment',
      message: error.message,
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Delete assessment (cascades to related records)
    const assessment = await prisma.assessment.deleteMany({
      where: {
        id,
        userId, // Ensure user can only delete their own assessments
      },
    });

    if (assessment.count === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting assessment:', error);

    return NextResponse.json({
      error: 'Failed to delete assessment',
      message: error.message,
    }, { status: 500 });
  }
}
