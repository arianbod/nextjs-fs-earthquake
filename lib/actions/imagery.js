'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Save Google Street View images for an assessment
 * @param {string} assessmentId - Assessment ID
 * @param {Array} streetViewImages - Array of street view image objects
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export async function saveStreetViewImages(assessmentId, streetViewImages) {
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

		if (!streetViewImages || streetViewImages.length === 0) {
			return { success: true, count: 0 };
		}

		// Delete existing street view images for this assessment
		await prisma.assessmentImage.deleteMany({
			where: {
				assessmentId,
				imageType: 'STREET_VIEW',
			},
		});

		// Prepare images for insertion
		const imagesToCreate = streetViewImages
			.filter((img) => img.available && img.url)
			.map((img) => ({
				assessmentId,
				imageType: 'STREET_VIEW',
				imageData: img.url, // Store URL for now, can be base64 later
				angle: img.heading || null,
				description: img.angle || `Street View ${img.heading || 0}°`,
				capturedAt: new Date(),
			}));

		if (imagesToCreate.length === 0) {
			return { success: true, count: 0 };
		}

		await prisma.assessmentImage.createMany({
			data: imagesToCreate,
		});

		return { success: true, count: imagesToCreate.length };
	} catch (error) {
		console.error('Error saving street view images:', error);
		return { success: false, error: 'Failed to save street view images' };
	}
}

/**
 * Save satellite image for an assessment
 * @param {string} assessmentId - Assessment ID
 * @param {string} satelliteUrl - Satellite image URL
 * @param {object} metadata - Additional metadata (lat, lng, zoom)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveSatelliteImage(assessmentId, satelliteUrl, metadata = {}) {
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

		if (!satelliteUrl) {
			return { success: true };
		}

		// Delete existing satellite image for this assessment
		await prisma.assessmentImage.deleteMany({
			where: {
				assessmentId,
				imageType: 'SATELLITE',
			},
		});

		// Create new satellite image record
		await prisma.assessmentImage.create({
			data: {
				assessmentId,
				imageType: 'SATELLITE',
				imageData: satelliteUrl,
				description: `Satellite view at ${metadata.latitude?.toFixed(4)}, ${metadata.longitude?.toFixed(4)}`,
				capturedAt: new Date(),
			},
		});

		return { success: true };
	} catch (error) {
		console.error('Error saving satellite image:', error);
		return { success: false, error: 'Failed to save satellite image' };
	}
}

/**
 * Save all Google imagery (Street View + Satellite) in one call
 * @param {string} assessmentId - Assessment ID
 * @param {object} imagery - Object containing streetViewImages and satelliteUrl
 * @returns {Promise<{success: boolean, streetViewCount?: number, hasSatellite?: boolean, error?: string}>}
 */
export async function saveGoogleImagery(assessmentId, imagery) {
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

		const { streetViewImages, satelliteUrl, latitude, longitude } = imagery;

		// Delete existing Google imagery
		await prisma.assessmentImage.deleteMany({
			where: {
				assessmentId,
				imageType: { in: ['STREET_VIEW', 'SATELLITE'] },
			},
		});

		const imagesToCreate = [];

		// Add street view images
		if (streetViewImages && streetViewImages.length > 0) {
			streetViewImages
				.filter((img) => img.available && img.url)
				.forEach((img) => {
					imagesToCreate.push({
						assessmentId,
						imageType: 'STREET_VIEW',
						imageData: img.url,
						angle: img.heading || null,
						description: img.angle || `Street View ${img.heading || 0}°`,
						capturedAt: new Date(),
					});
				});
		}

		// Add satellite image
		if (satelliteUrl) {
			imagesToCreate.push({
				assessmentId,
				imageType: 'SATELLITE',
				imageData: satelliteUrl,
				description: latitude && longitude
					? `Satellite view at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
					: 'Satellite view',
				capturedAt: new Date(),
			});
		}

		if (imagesToCreate.length > 0) {
			await prisma.assessmentImage.createMany({
				data: imagesToCreate,
			});
		}

		return {
			success: true,
			streetViewCount: imagesToCreate.filter((i) => i.imageType === 'STREET_VIEW').length,
			hasSatellite: !!satelliteUrl,
		};
	} catch (error) {
		console.error('Error saving Google imagery:', error);
		return { success: false, error: 'Failed to save Google imagery' };
	}
}

/**
 * Get Google imagery for an assessment
 * @param {string} assessmentId - Assessment ID
 * @returns {Promise<{success: boolean, streetViewImages?: array, satelliteUrl?: string, error?: string}>}
 */
export async function getGoogleImagery(assessmentId) {
	try {
		const images = await prisma.assessmentImage.findMany({
			where: {
				assessmentId,
				imageType: { in: ['STREET_VIEW', 'SATELLITE'] },
			},
			orderBy: { angle: 'asc' },
		});

		const streetViewImages = images
			.filter((img) => img.imageType === 'STREET_VIEW')
			.map((img) => ({
				url: img.imageData,
				heading: img.angle,
				angle: img.description,
				available: true,
			}));

		const satelliteImage = images.find((img) => img.imageType === 'SATELLITE');

		return {
			success: true,
			streetViewImages,
			satelliteUrl: satelliteImage?.imageData || null,
		};
	} catch (error) {
		console.error('Error fetching Google imagery:', error);
		return { success: false, error: 'Failed to fetch Google imagery' };
	}
}

/**
 * Save user uploaded photos for an assessment
 * @param {string} assessmentId - Assessment ID
 * @param {Array} photos - Array of photo objects with base64 data
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export async function saveUserPhotos(assessmentId, photos) {
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

		if (!photos || photos.length === 0) {
			return { success: true, count: 0 };
		}

		// Prepare user photos for insertion
		const imagesToCreate = photos.map((photo, index) => ({
			assessmentId,
			imageType: 'USER_UPLOAD',
			imageData: photo.base64 || photo.imageData || photo.url,
			fileName: photo.fileName || `photo_${index + 1}.jpg`,
			mimeType: photo.mimeType || 'image/jpeg',
			fileSize: photo.fileSize || null,
			description: photo.description || `User photo ${index + 1}`,
			capturedAt: photo.capturedAt ? new Date(photo.capturedAt) : new Date(),
		}));

		await prisma.assessmentImage.createMany({
			data: imagesToCreate,
		});

		return { success: true, count: imagesToCreate.length };
	} catch (error) {
		console.error('Error saving user photos:', error);
		return { success: false, error: 'Failed to save user photos' };
	}
}

/**
 * Get user uploaded photos for an assessment
 * @param {string} assessmentId - Assessment ID
 * @returns {Promise<{success: boolean, photos?: array, error?: string}>}
 */
export async function getUserPhotos(assessmentId) {
	try {
		const photos = await prisma.assessmentImage.findMany({
			where: {
				assessmentId,
				imageType: 'USER_UPLOAD',
			},
			orderBy: { uploadedAt: 'asc' },
		});

		return {
			success: true,
			photos: photos.map((photo) => ({
				id: photo.id,
				base64: photo.imageData,
				imageData: photo.imageData,
				fileName: photo.fileName,
				mimeType: photo.mimeType,
				fileSize: photo.fileSize,
				description: photo.description,
			})),
		};
	} catch (error) {
		console.error('Error fetching user photos:', error);
		return { success: false, error: 'Failed to fetch user photos' };
	}
}

/**
 * Get all images for an assessment
 * @param {string} assessmentId - Assessment ID
 * @returns {Promise<{success: boolean, images?: object, error?: string}>}
 */
export async function getAllAssessmentImages(assessmentId) {
	try {
		const images = await prisma.assessmentImage.findMany({
			where: { assessmentId },
			orderBy: [{ imageType: 'asc' }, { uploadedAt: 'asc' }],
		});

		// Group by type
		const grouped = {
			streetView: [],
			satellite: null,
			userPhotos: [],
		};

		images.forEach((img) => {
			if (img.imageType === 'STREET_VIEW') {
				grouped.streetView.push({
					url: img.imageData,
					heading: img.angle,
					angle: img.description,
					available: true,
				});
			} else if (img.imageType === 'SATELLITE') {
				grouped.satellite = img.imageData;
			} else if (img.imageType === 'USER_UPLOAD') {
				grouped.userPhotos.push({
					id: img.id,
					base64: img.imageData,
					imageData: img.imageData,
					fileName: img.fileName,
				});
			}
		});

		return { success: true, images: grouped };
	} catch (error) {
		console.error('Error fetching assessment images:', error);
		return { success: false, error: 'Failed to fetch assessment images' };
	}
}

/**
 * Delete specific image
 * @param {string} imageId - Image ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteAssessmentImage(imageId) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return { success: false, error: 'Unauthorized' };
		}

		// Get image and verify ownership through assessment
		const image = await prisma.assessmentImage.findUnique({
			where: { id: imageId },
			include: {
				assessment: {
					select: { userId: true },
				},
			},
		});

		if (!image || image.assessment.userId !== userId) {
			return { success: false, error: 'Image not found or unauthorized' };
		}

		await prisma.assessmentImage.delete({
			where: { id: imageId },
		});

		return { success: true };
	} catch (error) {
		console.error('Error deleting image:', error);
		return { success: false, error: 'Failed to delete image' };
	}
}
