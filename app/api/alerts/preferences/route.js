/**
 * GET /api/alerts/preferences - Get user alert preferences
 * PUT /api/alerts/preferences - Update user alert preferences
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';

/**
 * GET - Get user's alert preferences
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let preferences = await prisma.userAlertPreferences.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          where: { active: true },
          select: {
            id: true,
            type: true,
            deviceName: true,
            browser: true,
            platform: true,
            lastUsed: true,
          },
        },
      },
    });

    // Create default preferences if not exist
    if (!preferences) {
      preferences = await prisma.userAlertPreferences.create({
        data: { userId },
        include: {
          subscriptions: true,
        },
      });
    }

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update user's alert preferences
 */
export async function PUT(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate thresholds
    if (body.minMagnitude !== undefined) {
      if (body.minMagnitude < 2.0 || body.minMagnitude > 8.0) {
        return NextResponse.json(
          { error: 'minMagnitude must be between 2.0 and 8.0' },
          { status: 400 }
        );
      }
    }

    if (body.maxDistanceKm !== undefined) {
      if (body.maxDistanceKm < 10 || body.maxDistanceKm > 500) {
        return NextResponse.json(
          { error: 'maxDistanceKm must be between 10 and 500' },
          { status: 400 }
        );
      }
    }

    if (body.cooldownMinutes !== undefined) {
      if (body.cooldownMinutes < 1 || body.cooldownMinutes > 60) {
        return NextResponse.json(
          { error: 'cooldownMinutes must be between 1 and 60' },
          { status: 400 }
        );
      }
    }

    if (body.dailyLimit !== undefined) {
      if (body.dailyLimit < 1 || body.dailyLimit > 100) {
        return NextResponse.json(
          { error: 'dailyLimit must be between 1 and 100' },
          { status: 400 }
        );
      }
    }

    // Build update data - only include fields that are provided
    const updateData = {};
    const allowedFields = [
      'alertsEnabled',
      'pushEnabled',
      'emailEnabled',
      'minMagnitude',
      'maxDistanceKm',
      'criticalMagnitude',
      'quietHoursEnabled',
      'quietHoursStart',
      'quietHoursEnd',
      'cooldownMinutes',
      'dailyLimit',
      'emailAddress',
      'language',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const preferences = await prisma.userAlertPreferences.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
      include: {
        subscriptions: {
          where: { active: true },
        },
      },
    });

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
