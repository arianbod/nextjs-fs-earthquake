/**
 * GET /api/alerts/notifications - Get user's notifications
 *
 * Query parameters:
 * - status: string (PENDING, SENT, READ, FAILED, all)
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where = { userId };
    if (status !== 'all') {
      where.status = status;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.alertNotification.findMany({
        where,
        include: {
          earthquake: {
            select: {
              id: true,
              magnitude: true,
              location: true,
              region: true,
              eventTime: true,
              latitude: true,
              longitude: true,
              depth: true,
              source: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.alertNotification.count({ where }),
      prisma.alertNotification.count({
        where: {
          userId,
          status: { notIn: ['READ'] },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        total,
        unreadCount,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/alerts/notifications - Mark multiple notifications as read
 */
export async function PATCH(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids } = body;

    if (action === 'markAllRead') {
      // Mark all user's notifications as read
      await prisma.alertNotification.updateMany({
        where: {
          userId,
          status: { notIn: ['READ'] },
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (action === 'markRead' && Array.isArray(ids)) {
      // Mark specific notifications as read
      await prisma.alertNotification.updateMany({
        where: {
          id: { in: ids },
          userId, // Ensure user owns these notifications
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: `${ids.length} notifications marked as read` });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
