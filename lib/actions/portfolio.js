'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Get portfolio summary with aggregate statistics
 * @returns {Promise<{success: boolean, stats?: object, assessments?: array, error?: string}>}
 */
export async function getPortfolioSummary() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        userId,
        status: { not: 'ARCHIVED' }
      },
      include: {
        safetyResult: {
          select: {
            overallScore: true,
            riskLevel: true,
            safetyRating: true,
          }
        },
        location: {
          select: {
            city: true,
            district: true,
            fullAddress: true,
          }
        },
        buildingInfo: {
          select: {
            buildingType: true,
            numberOfFloors: true,
          }
        },
        groups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
              }
            }
          }
        },
        images: {
          where: {
            imageType: { in: ['USER_UPLOAD', 'STREET_VIEW', 'SATELLITE'] },
          },
          orderBy: { uploadedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            imageType: true,
            imageData: true,
            thumbnailData: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    // Calculate aggregate statistics
    const stats = {
      totalProperties: assessments.length,
      completed: 0,
      inProgress: 0,
      draft: 0,
      byRisk: {
        low: 0,
        moderate: 0,
        high: 0,
        veryHigh: 0,
      },
      byCity: {},
      averageScore: null,
      needsReassessment: 0,
      highestRisk: null,
      lowestScore: null,
    };

    let totalScore = 0;
    let scoredCount = 0;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    assessments.forEach(a => {
      // Status counts
      if (a.status === 'COMPLETE') stats.completed++;
      else if (a.status === 'IN_PROGRESS') stats.inProgress++;
      else if (a.status === 'DRAFT') stats.draft++;

      // Risk level counts
      if (a.safetyResult?.riskLevel) {
        const risk = a.safetyResult.riskLevel.toLowerCase().replace(' ', '');
        if (risk === 'low') stats.byRisk.low++;
        else if (risk === 'moderate') stats.byRisk.moderate++;
        else if (risk === 'high') stats.byRisk.high++;
        else if (risk === 'veryhigh') stats.byRisk.veryHigh++;
      }

      // City counts
      const city = a.location?.city || 'Unknown';
      stats.byCity[city] = (stats.byCity[city] || 0) + 1;

      // Score calculations
      if (a.safetyResult?.overallScore !== undefined && a.safetyResult?.overallScore !== null) {
        const score = a.safetyResult.overallScore;
        totalScore += score;
        scoredCount++;

        // Track lowest score
        if (stats.lowestScore === null || score < stats.lowestScore) {
          stats.lowestScore = score;
          stats.highestRisk = {
            id: a.id,
            title: a.nickname || a.title || a.location?.city || 'Assessment',
            score: Math.round(score),
            riskLevel: a.safetyResult.riskLevel,
          };
        }
      }

      // Reassessment check (completed more than 1 year ago)
      if (a.status === 'COMPLETE' && a.completedAt && new Date(a.completedAt) < oneYearAgo) {
        stats.needsReassessment++;
      }
    });

    stats.averageScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;

    return {
      success: true,
      stats,
      assessments: assessments.map(a => ({
        ...a,
        displayName: a.nickname || a.title || a.location?.fullAddress || a.location?.city || 'Unnamed Property',
      })),
    };
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    return { success: false, error: 'Failed to fetch portfolio summary' };
  }
}

/**
 * Get all groups for current user
 * @returns {Promise<{success: boolean, groups?: array, error?: string}>}
 */
export async function getGroups() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const groups = await prisma.propertyGroup.findMany({
      where: { userId },
      include: {
        assessments: {
          include: {
            assessment: {
              select: {
                id: true,
                status: true,
                safetyResult: {
                  select: {
                    riskLevel: true,
                    overallScore: true
                  }
                },
              },
            },
          },
        },
        _count: {
          select: { assessments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Add stats to each group
    const groupsWithStats = groups.map(group => {
      const assessments = group.assessments.map(ag => ag.assessment);
      const completed = assessments.filter(a => a.status === 'COMPLETE').length;
      const avgScore = assessments.reduce((sum, a) => {
        return sum + (a.safetyResult?.overallScore || 0);
      }, 0) / (completed || 1);

      return {
        ...group,
        stats: {
          total: group._count.assessments,
          completed,
          averageScore: completed > 0 ? Math.round(avgScore) : null,
        },
      };
    });

    return { success: true, groups: groupsWithStats };
  } catch (error) {
    console.error('Error fetching groups:', error);
    return { success: false, error: 'Failed to fetch groups' };
  }
}

/**
 * Create a new property group
 * @param {object} data - Group data
 * @returns {Promise<{success: boolean, group?: object, error?: string}>}
 */
export async function createGroup(data) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: 'Group name is required' };
    }

    const group = await prisma.propertyGroup.create({
      data: {
        userId,
        name: data.name.slice(0, 50).trim(),
        description: data.description?.slice(0, 200)?.trim() || null,
        color: data.color || '#3B82F6',
        icon: data.icon || 'folder',
      },
    });

    revalidatePath('/portfolio');
    return { success: true, group };
  } catch (error) {
    console.error('Error creating group:', error);
    return { success: false, error: 'Failed to create group' };
  }
}

/**
 * Update an existing group
 * @param {string} groupId - Group ID
 * @param {object} data - Updated data
 * @returns {Promise<{success: boolean, group?: object, error?: string}>}
 */
export async function updateGroup(groupId, data) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const existing = await prisma.propertyGroup.findFirst({
      where: { id: groupId, userId },
    });

    if (!existing) {
      return { success: false, error: 'Group not found' };
    }

    const group = await prisma.propertyGroup.update({
      where: { id: groupId },
      data: {
        name: data.name?.slice(0, 50)?.trim() || existing.name,
        description: data.description?.slice(0, 200)?.trim(),
        color: data.color || existing.color,
        icon: data.icon || existing.icon,
      },
    });

    revalidatePath('/portfolio');
    return { success: true, group };
  } catch (error) {
    console.error('Error updating group:', error);
    return { success: false, error: 'Failed to update group' };
  }
}

/**
 * Delete a group (keeps assessments)
 * @param {string} groupId - Group ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteGroup(groupId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete only if owned by user
    const result = await prisma.propertyGroup.deleteMany({
      where: { id: groupId, userId },
    });

    if (result.count === 0) {
      return { success: false, error: 'Group not found' };
    }

    revalidatePath('/portfolio');
    return { success: true };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { success: false, error: 'Failed to delete group' };
  }
}

/**
 * Add assessment to a group
 * @param {string} assessmentId - Assessment ID
 * @param {string} groupId - Group ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function addToGroup(assessmentId, groupId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership of both assessment and group
    const [assessment, group] = await Promise.all([
      prisma.assessment.findFirst({ where: { id: assessmentId, userId } }),
      prisma.propertyGroup.findFirst({ where: { id: groupId, userId } }),
    ]);

    if (!assessment) {
      return { success: false, error: 'Assessment not found' };
    }

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    // Add to group (upsert to handle duplicates gracefully)
    await prisma.assessmentGroup.upsert({
      where: {
        assessmentId_groupId: { assessmentId, groupId }
      },
      create: { assessmentId, groupId },
      update: {}, // No update needed if already exists
    });

    revalidatePath('/portfolio');
    return { success: true };
  } catch (error) {
    console.error('Error adding to group:', error);
    return { success: false, error: 'Failed to add to group' };
  }
}

/**
 * Remove assessment from group
 * @param {string} assessmentId - Assessment ID
 * @param {string} groupId - Group ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function removeFromGroup(assessmentId, groupId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify group ownership
    const group = await prisma.propertyGroup.findFirst({
      where: { id: groupId, userId },
    });

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    await prisma.assessmentGroup.deleteMany({
      where: { assessmentId, groupId },
    });

    revalidatePath('/portfolio');
    return { success: true };
  } catch (error) {
    console.error('Error removing from group:', error);
    return { success: false, error: 'Failed to remove from group' };
  }
}

/**
 * Update assessment nickname
 * @param {string} assessmentId - Assessment ID
 * @param {string} nickname - New nickname
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateAssessmentNickname(assessmentId, nickname) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await prisma.assessment.updateMany({
      where: { id: assessmentId, userId },
      data: { nickname: nickname?.slice(0, 100)?.trim() || null },
    });

    if (result.count === 0) {
      return { success: false, error: 'Assessment not found' };
    }

    revalidatePath('/portfolio');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating nickname:', error);
    return { success: false, error: 'Failed to update nickname' };
  }
}

/**
 * Update assessment tags
 * @param {string} assessmentId - Assessment ID
 * @param {string[]} tags - Array of tags
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateAssessmentTags(assessmentId, tags) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate and sanitize tags
    const cleanTags = (tags || [])
      .slice(0, 10) // Max 10 tags
      .map(t => t.slice(0, 30).trim()) // Max 30 chars each
      .filter(t => t.length > 0);

    const result = await prisma.assessment.updateMany({
      where: { id: assessmentId, userId },
      data: { tags: cleanTags },
    });

    if (result.count === 0) {
      return { success: false, error: 'Assessment not found' };
    }

    revalidatePath('/portfolio');
    return { success: true };
  } catch (error) {
    console.error('Error updating tags:', error);
    return { success: false, error: 'Failed to update tags' };
  }
}

/**
 * Update assessment priority
 * @param {string} assessmentId - Assessment ID
 * @param {number} priority - Priority value (higher = more important)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateAssessmentPriority(assessmentId, priority) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await prisma.assessment.updateMany({
      where: { id: assessmentId, userId },
      data: { priority: Math.max(0, Math.min(100, priority || 0)) },
    });

    if (result.count === 0) {
      return { success: false, error: 'Assessment not found' };
    }

    revalidatePath('/portfolio');
    return { success: true };
  } catch (error) {
    console.error('Error updating priority:', error);
    return { success: false, error: 'Failed to update priority' };
  }
}

/**
 * Bulk add assessments to a group
 * @param {string[]} assessmentIds - Array of assessment IDs
 * @param {string} groupId - Group ID
 * @returns {Promise<{success: boolean, added?: number, error?: string}>}
 */
export async function bulkAddToGroup(assessmentIds, groupId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify group ownership
    const group = await prisma.propertyGroup.findFirst({
      where: { id: groupId, userId },
    });

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    // Verify all assessments belong to user
    const assessments = await prisma.assessment.findMany({
      where: { id: { in: assessmentIds }, userId },
      select: { id: true },
    });

    const validIds = assessments.map(a => a.id);

    // Create records (skip duplicates)
    const result = await prisma.assessmentGroup.createMany({
      data: validIds.map(assessmentId => ({ assessmentId, groupId })),
      skipDuplicates: true,
    });

    revalidatePath('/portfolio');
    return { success: true, added: result.count };
  } catch (error) {
    console.error('Error bulk adding to group:', error);
    return { success: false, error: 'Failed to add to group' };
  }
}

/**
 * Get assessments for bulk export
 * @param {string[]} assessmentIds - Array of assessment IDs
 * @returns {Promise<{success: boolean, assessments?: array, error?: string}>}
 */
export async function getBulkExportData(assessmentIds) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        id: { in: assessmentIds },
        userId,
        status: 'COMPLETE',
      },
      include: {
        location: true,
        buildingInfo: true,
        safetyResult: true,
      },
    });

    return { success: true, assessments };
  } catch (error) {
    console.error('Error fetching export data:', error);
    return { success: false, error: 'Failed to fetch export data' };
  }
}
