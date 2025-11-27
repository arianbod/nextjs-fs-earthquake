'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Save an image to the database
 * @param {object} params - Image parameters
 * @returns {Promise<{success: boolean, imageId?: string, error?: string}>}
 */
export async function saveImage({
  assessmentId,
  imageType,
  imageData,
  thumbnailData = null,
  fileName = null,
  mimeType = 'image/jpeg',
  fileSize = null,
  description = null,
  angle = null,
  aiAnalysis = null,
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate mime type
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return { success: false, error: `Invalid file type: ${mimeType}` };
    }

    // Calculate size from base64 if not provided
    const size = fileSize || Math.ceil((imageData.length * 3) / 4);

    if (size > MAX_FILE_SIZE) {
      return { success: false, error: `File too large: ${size} bytes (max ${MAX_FILE_SIZE})` };
    }

    // Verify assessment ownership if assessmentId provided
    if (assessmentId) {
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        select: { userId: true },
      });

      if (!assessment || assessment.userId !== userId) {
        return { success: false, error: 'Assessment not found or unauthorized' };
      }
    }

    const image = await prisma.assessmentImage.create({
      data: {
        assessmentId,
        imageType,
        imageData,
        thumbnailData,
        fileName,
        mimeType,
        fileSize: size,
        description,
        angle,
        aiAnalysis,
        capturedAt: new Date(),
      },
    });

    return {
      success: true,
      imageId: image.id,
    };
  } catch (error) {
    console.error('Error saving image:', error);
    return { success: false, error: 'Failed to save image' };
  }
}

/**
 * Save multiple images at once
 * @param {string} assessmentId - Assessment ID
 * @param {array} images - Array of image objects
 * @returns {Promise<{success: boolean, count?: number, imageIds?: string[], error?: string}>}
 */
export async function saveImages(assessmentId, images) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify assessment ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true },
    });

    if (!assessment || assessment.userId !== userId) {
      return { success: false, error: 'Assessment not found or unauthorized' };
    }

    // Validate all images
    for (const img of images) {
      if (!ALLOWED_TYPES.includes(img.mimeType || 'image/jpeg')) {
        return { success: false, error: `Invalid file type: ${img.mimeType}` };
      }
      const size = img.fileSize || Math.ceil((img.imageData.length * 3) / 4);
      if (size > MAX_FILE_SIZE) {
        return { success: false, error: `File too large: ${size} bytes` };
      }
    }

    // Create all images
    const createdImages = await Promise.all(
      images.map((img) =>
        prisma.assessmentImage.create({
          data: {
            assessmentId,
            imageType: img.imageType,
            imageData: img.imageData,
            thumbnailData: img.thumbnailData || null,
            fileName: img.fileName || null,
            mimeType: img.mimeType || 'image/jpeg',
            fileSize: img.fileSize || Math.ceil((img.imageData.length * 3) / 4),
            description: img.description || null,
            angle: img.angle || null,
            aiAnalysis: img.aiAnalysis || null,
            capturedAt: new Date(),
          },
        })
      )
    );

    return {
      success: true,
      count: createdImages.length,
      imageIds: createdImages.map((img) => img.id),
    };
  } catch (error) {
    console.error('Error saving images:', error);
    return { success: false, error: 'Failed to save images' };
  }
}

/**
 * Get image by ID (with data)
 * @param {string} id - Image ID
 * @returns {Promise<{success: boolean, image?: object, error?: string}>}
 */
export async function getImage(id) {
  try {
    const image = await prisma.assessmentImage.findUnique({
      where: { id },
    });

    if (!image) {
      return { success: false, error: 'Image not found' };
    }

    return { success: true, image };
  } catch (error) {
    console.error('Error fetching image:', error);
    return { success: false, error: 'Failed to fetch image' };
  }
}

/**
 * Get image metadata only (fast, no data)
 * @param {string} id - Image ID
 * @returns {Promise<{success: boolean, image?: object, error?: string}>}
 */
export async function getImageMetadata(id) {
  try {
    const image = await prisma.assessmentImage.findUnique({
      where: { id },
      select: {
        id: true,
        assessmentId: true,
        imageType: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        description: true,
        angle: true,
        capturedAt: true,
        uploadedAt: true,
      },
    });

    if (!image) {
      return { success: false, error: 'Image not found' };
    }

    return { success: true, image };
  } catch (error) {
    console.error('Error fetching image metadata:', error);
    return { success: false, error: 'Failed to fetch image metadata' };
  }
}

/**
 * Get all images for an assessment
 * @param {string} assessmentId - Assessment ID
 * @param {string} imageType - Optional filter by type
 * @param {boolean} includeData - Include image data (default false for performance)
 * @returns {Promise<{success: boolean, images?: array, error?: string}>}
 */
export async function getAssessmentImages(assessmentId, imageType = null, includeData = false) {
  try {
    const images = await prisma.assessmentImage.findMany({
      where: {
        assessmentId,
        ...(imageType && { imageType }),
      },
      orderBy: { capturedAt: 'asc' },
      select: includeData
        ? undefined
        : {
            id: true,
            imageType: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            description: true,
            angle: true,
            thumbnailData: true, // Include thumbnail for previews
            aiAnalysis: true,
            capturedAt: true,
          },
    });

    return { success: true, images };
  } catch (error) {
    console.error('Error fetching assessment images:', error);
    return { success: false, error: 'Failed to fetch images' };
  }
}

/**
 * Delete an image
 * @param {string} id - Image ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteImage(id) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get image with assessment to verify ownership
    const image = await prisma.assessmentImage.findUnique({
      where: { id },
      include: {
        assessment: {
          select: { userId: true },
        },
      },
    });

    if (!image) {
      return { success: false, error: 'Image not found' };
    }

    if (image.assessment?.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.assessmentImage.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}

/**
 * Delete all images for an assessment
 * @param {string} assessmentId - Assessment ID
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export async function deleteAssessmentImages(assessmentId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify assessment ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true },
    });

    if (!assessment || assessment.userId !== userId) {
      return { success: false, error: 'Assessment not found or unauthorized' };
    }

    const result = await prisma.assessmentImage.deleteMany({
      where: { assessmentId },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error deleting assessment images:', error);
    return { success: false, error: 'Failed to delete images' };
  }
}

/**
 * Update image AI analysis
 * @param {string} id - Image ID
 * @param {object} aiAnalysis - AI analysis data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateImageAnalysis(id, aiAnalysis) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get image with assessment to verify ownership
    const image = await prisma.assessmentImage.findUnique({
      where: { id },
      include: {
        assessment: {
          select: { userId: true },
        },
      },
    });

    if (!image || image.assessment?.userId !== userId) {
      return { success: false, error: 'Image not found or unauthorized' };
    }

    await prisma.assessmentImage.update({
      where: { id },
      data: { aiAnalysis },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating image analysis:', error);
    return { success: false, error: 'Failed to update image analysis' };
  }
}
