'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Create a new assessment
 * @returns {Promise<{success: boolean, assessmentId?: string, error?: string}>}
 */
export async function createAssessment() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const assessment = await prisma.assessment.create({
      data: {
        userId,
        status: 'DRAFT',
        currentStep: 1,
      },
    });

    return {
      success: true,
      assessmentId: assessment.id,
    };
  } catch (error) {
    console.error('Error creating assessment:', error);
    return { success: false, error: 'Failed to create assessment' };
  }
}

/**
 * Get single assessment by ID
 * @param {string} id - Assessment ID
 * @param {boolean} includeImages - Whether to include image data
 * @returns {Promise<{success: boolean, assessment?: object, isOwner?: boolean, error?: string}>}
 */
export async function getAssessment(id, includeImages = false) {
  try {
    const { userId } = await auth();

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        location: true,
        buildingInfo: true,
        safetyResult: true,
        images: includeImages
          ? true
          : {
              select: {
                id: true,
                imageType: true,
                fileName: true,
                mimeType: true,
                fileSize: true,
                angle: true,
                description: true,
                capturedAt: true,
                // NOT including imageData for performance
              },
            },
      },
    });

    if (!assessment) {
      return { success: false, error: 'Assessment not found' };
    }

    // If archived and not owner, deny access
    if (assessment.status === 'ARCHIVED' && assessment.userId !== userId) {
      return { success: false, error: 'Assessment not found' };
    }

    return {
      success: true,
      assessment,
      isOwner: assessment.userId === userId,
    };
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return { success: false, error: 'Failed to fetch assessment' };
  }
}

/**
 * Get user's assessments (for dashboard)
 * @param {object} options - Query options
 * @returns {Promise<{success: boolean, assessments?: array, total?: number, hasMore?: boolean, error?: string}>}
 */
export async function getUserAssessments(options = {}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const {
      status = null,
      limit = 20,
      offset = 0,
      orderBy = 'updatedAt',
      order = 'desc',
    } = options;

    // Build where clause - exclude ARCHIVED unless specifically requested
    const where = {
      userId,
      ...(status
        ? { status }
        : { status: { not: 'ARCHIVED' } }),
    };

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        orderBy: { [orderBy]: order },
        skip: offset,
        take: Math.min(limit, 100),
        include: {
          location: {
            select: {
              fullAddress: true,
              city: true,
              district: true,
            },
          },
          safetyResult: {
            select: {
              overallScore: true,
              riskLevel: true,
              safetyRating: true,
            },
          },
          images: {
            where: { imageType: 'USER_UPLOAD' },
            take: 1,
            select: {
              id: true,
              thumbnailData: true,
            },
          },
        },
      }),
      prisma.assessment.count({ where }),
    ]);

    return {
      success: true,
      assessments,
      total,
      hasMore: offset + assessments.length < total,
    };
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return { success: false, error: 'Failed to fetch assessments' };
  }
}

/**
 * Update assessment data
 * @param {string} id - Assessment ID
 * @param {object} data - Data to update
 * @returns {Promise<{success: boolean, assessment?: object, error?: string}>}
 */
export async function updateAssessment(id, data) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const existing = await prisma.assessment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return { success: false, error: 'Assessment not found or unauthorized' };
    }

    // Extract allowed fields
    const {
      status,
      currentStep,
      title,
      weather,
      structuralSystem,
      irregularities,
      planDefinition,
      manipulations,
      specificConditions,
      extraLoad,
      neighborBuildings,
    } = data;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (currentStep !== undefined) updateData.currentStep = currentStep;
    if (title !== undefined) updateData.title = title;
    if (weather !== undefined) updateData.weather = weather;
    if (structuralSystem !== undefined) updateData.structuralSystem = structuralSystem;
    if (irregularities !== undefined) updateData.irregularities = irregularities;
    if (planDefinition !== undefined) updateData.planDefinition = planDefinition;
    if (manipulations !== undefined) updateData.manipulations = manipulations;
    if (specificConditions !== undefined) updateData.specificConditions = specificConditions;
    if (extraLoad !== undefined) updateData.extraLoad = extraLoad;
    if (neighborBuildings !== undefined) updateData.neighborBuildings = neighborBuildings;

    const assessment = await prisma.assessment.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      assessment,
    };
  } catch (error) {
    console.error('Error updating assessment:', error);
    return { success: false, error: 'Failed to update assessment' };
  }
}

/**
 * Update or create location data for assessment
 * @param {string} assessmentId - Assessment ID
 * @param {object} locationData - Location data
 * @returns {Promise<{success: boolean, location?: object, error?: string}>}
 */
export async function saveLocation(assessmentId, locationData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true },
    });

    if (!assessment || assessment.userId !== userId) {
      return { success: false, error: 'Assessment not found or unauthorized' };
    }

    // Only include fields that exist in the Location model
    const validLocationFields = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy || null,
      fullAddress: locationData.fullAddress || locationData.address || '',
      city: locationData.city || null,
      district: locationData.district || null,
      neighborhood: locationData.neighborhood || null,
      country: locationData.country || null,
      postalCode: locationData.postalCode || null,
      placeId: locationData.placeId || locationData.googlePlaceId || null,
      placeName: locationData.placeName || null,
      weatherCondition: locationData.weatherCondition || null,
      temperature: locationData.temperature || null,
      earthquakeZone: locationData.earthquakeZone || null,
      seismicActivity: locationData.seismicActivity || null,
    };

    // Remove null/undefined values for cleaner data
    const cleanedData = Object.fromEntries(
      Object.entries(validLocationFields).filter(([_, v]) => v !== undefined)
    );

    const location = await prisma.location.upsert({
      where: { assessmentId },
      create: {
        assessmentId,
        ...cleanedData,
      },
      update: cleanedData,
    });

    // Update assessment status if still DRAFT
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: 'IN_PROGRESS',
        currentStep: 2,
        title: locationData.fullAddress || locationData.city || 'Assessment',
      },
    });

    return { success: true, location };
  } catch (error) {
    console.error('Error saving location:', error);
    return { success: false, error: 'Failed to save location' };
  }
}

/**
 * Update or create building info for assessment
 * @param {string} assessmentId - Assessment ID
 * @param {object} buildingData - Building data
 * @returns {Promise<{success: boolean, buildingInfo?: object, error?: string}>}
 */
export async function saveBuildingInfo(assessmentId, buildingData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true, currentStep: true },
    });

    if (!assessment || assessment.userId !== userId) {
      return { success: false, error: 'Assessment not found or unauthorized' };
    }

    const buildingInfo = await prisma.buildingInfo.upsert({
      where: { assessmentId },
      create: {
        assessmentId,
        ...buildingData,
      },
      update: buildingData,
    });

    // Update step if moving forward
    if (assessment.currentStep < 5) {
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: { currentStep: 5 },
      });
    }

    return { success: true, buildingInfo };
  } catch (error) {
    console.error('Error saving building info:', error);
    return { success: false, error: 'Failed to save building info' };
  }
}

/**
 * Save safety result for assessment
 * @param {string} assessmentId - Assessment ID
 * @param {object} resultData - Safety result data
 * @returns {Promise<{success: boolean, safetyResult?: object, error?: string}>}
 */
export async function saveSafetyResult(assessmentId, resultData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true },
    });

    if (!assessment || assessment.userId !== userId) {
      return { success: false, error: 'Assessment not found or unauthorized' };
    }

    const safetyResult = await prisma.safetyResult.upsert({
      where: { assessmentId },
      create: {
        assessmentId,
        ...resultData,
      },
      update: resultData,
    });

    // Mark assessment as complete
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: 'COMPLETE',
        completedAt: new Date(),
      },
    });

    revalidatePath('/dashboard');
    revalidatePath(`/result/${assessmentId}`);

    return { success: true, safetyResult };
  } catch (error) {
    console.error('Error saving safety result:', error);
    return { success: false, error: 'Failed to save safety result' };
  }
}

/**
 * Archive (soft delete) assessment
 * @param {string} id - Assessment ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function archiveAssessment(id) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!assessment || assessment.userId !== userId) {
      return { success: false, error: 'Assessment not found or unauthorized' };
    }

    await prisma.assessment.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error archiving assessment:', error);
    return { success: false, error: 'Failed to archive assessment' };
  }
}

/**
 * Permanently delete assessment
 * @param {string} id - Assessment ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteAssessment(id) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!assessment || assessment.userId !== userId) {
      return { success: false, error: 'Assessment not found or unauthorized' };
    }

    // Delete assessment (cascades to location, buildingInfo, safetyResult, images)
    await prisma.assessment.delete({
      where: { id },
    });

    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return { success: false, error: 'Failed to delete assessment' };
  }
}

/**
 * Duplicate assessment
 * @param {string} id - Assessment ID to duplicate
 * @returns {Promise<{success: boolean, assessmentId?: string, error?: string}>}
 */
export async function duplicateAssessment(id) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get original assessment with all relations
    const original = await prisma.assessment.findUnique({
      where: { id },
      include: {
        location: true,
        buildingInfo: true,
        images: true,
      },
    });

    if (!original || original.userId !== userId) {
      return { success: false, error: 'Assessment not found or unauthorized' };
    }

    // Create new assessment
    const newAssessment = await prisma.assessment.create({
      data: {
        userId,
        status: 'DRAFT',
        currentStep: original.currentStep,
        title: `Copy of ${original.title || 'Assessment'}`,
        weather: original.weather,
        structuralSystem: original.structuralSystem,
        irregularities: original.irregularities,
        planDefinition: original.planDefinition,
        manipulations: original.manipulations,
        specificConditions: original.specificConditions,
        extraLoad: original.extraLoad,
        neighborBuildings: original.neighborBuildings,
      },
    });

    // Duplicate location if exists
    if (original.location) {
      const { id: _, assessmentId: __, ...locationData } = original.location;
      await prisma.location.create({
        data: {
          ...locationData,
          assessmentId: newAssessment.id,
        },
      });
    }

    // Duplicate building info if exists
    if (original.buildingInfo) {
      const { id: _, assessmentId: __, ...buildingData } = original.buildingInfo;
      await prisma.buildingInfo.create({
        data: {
          ...buildingData,
          assessmentId: newAssessment.id,
        },
      });
    }

    // Duplicate images
    if (original.images.length > 0) {
      await prisma.assessmentImage.createMany({
        data: original.images.map((img) => {
          const { id: _, assessmentId: __, ...imageData } = img;
          return {
            ...imageData,
            assessmentId: newAssessment.id,
          };
        }),
      });
    }

    revalidatePath('/dashboard');

    return {
      success: true,
      assessmentId: newAssessment.id,
    };
  } catch (error) {
    console.error('Error duplicating assessment:', error);
    return { success: false, error: 'Failed to duplicate assessment' };
  }
}

/**
 * Get dashboard statistics
 * @returns {Promise<{success: boolean, stats?: object, error?: string}>}
 */
export async function getDashboardStats() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const [totalCount, completedCount, avgScoreResult] = await Promise.all([
      prisma.assessment.count({
        where: {
          userId,
          status: { not: 'ARCHIVED' },
        },
      }),
      prisma.assessment.count({
        where: {
          userId,
          status: 'COMPLETE',
        },
      }),
      prisma.safetyResult.aggregate({
        where: {
          assessment: {
            userId,
            status: 'COMPLETE',
          },
        },
        _avg: {
          overallScore: true,
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        total: totalCount,
        completed: completedCount,
        inProgress: totalCount - completedCount,
        averageScore: avgScoreResult._avg.overallScore
          ? Math.round(avgScoreResult._avg.overallScore)
          : null,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: 'Failed to fetch statistics' };
  }
}
