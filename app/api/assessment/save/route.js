/**
 * Save Assessment API Endpoint
 * POST /api/assessment/save
 * Saves complete assessment data to database
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';

export async function POST(request) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Create assessment with all related data
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        assessmentType: data.assessmentType || 'complete',
        version: data.version || '1.0',
        completedAt: new Date(),

        // Location data
        location: data.location ? {
          create: {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            accuracy: data.location.accuracy,
            fullAddress: data.location.fullAddress,
            city: data.location.city,
            district: data.location.district,
            neighborhood: data.location.neighborhood,
            country: data.location.country,
            postalCode: data.location.postalCode,
            placeId: data.location.placeId,
            placeName: data.location.placeName,
            weatherCondition: data.location.weatherCondition,
            temperature: data.location.temperature,
            earthquakeZone: data.location.earthquakeZone,
            seismicActivity: data.location.seismicActivity,
          }
        } : undefined,

        // Building information
        buildingInfo: data.buildingInfo ? {
          create: {
            buildingName: data.buildingInfo.buildingName,
            buildingType: data.buildingInfo.buildingType,
            numberOfFloors: data.buildingInfo.numberOfFloors,
            floorArea: data.buildingInfo.floorArea,
            buildingAge: data.buildingInfo.buildingAge,
            constructionYear: data.buildingInfo.constructionYear,
            structuralSystem: data.buildingInfo.structuralSystem,
            frameType: data.buildingInfo.frameType,
            foundationType: data.buildingInfo.foundationType,
            buildingCode: data.buildingInfo.buildingCode,
            codeCompliance: data.buildingInfo.codeCompliance,
            hasRetrofit: data.buildingInfo.hasRetrofit || false,
            retrofitYear: data.buildingInfo.retrofitYear,
            hasVerticalIrregularity: data.buildingInfo.hasVerticalIrregularity || false,
            hasPlanIrregularity: data.buildingInfo.hasPlanIrregularity || false,
            hasShortColumn: data.buildingInfo.hasShortColumn || false,
            hasSoftStory: data.buildingInfo.hasSoftStory || false,
            hasHeavyOverhang: data.buildingInfo.hasHeavyOverhang || false,
            soilType: data.buildingInfo.soilType,
            slopeCondition: data.buildingInfo.slopeCondition,
            liquefactionRisk: data.buildingInfo.liquefactionRisk,
            hasSwimmingPool: data.buildingInfo.hasSwimmingPool || false,
            hasWaterTank: data.buildingInfo.hasWaterTank || false,
            hasHeavyEquipment: data.buildingInfo.hasHeavyEquipment || false,
            hasAdjacentBuildings: data.buildingInfo.hasAdjacentBuildings || false,
            poundingRisk: data.buildingInfo.poundingRisk,
            materialCondition: data.buildingInfo.materialCondition,
            visibleDamage: data.buildingInfo.visibleDamage || false,
            damageDescription: data.buildingInfo.damageDescription,
          }
        } : undefined,

        // Safety results
        safetyResult: data.safetyResult ? {
          create: {
            overallScore: data.safetyResult.overallScore,
            riskLevel: data.safetyResult.riskLevel,
            safetyRating: data.safetyResult.safetyRating,
            structuralScore: data.safetyResult.structuralScore,
            foundationScore: data.safetyResult.foundationScore,
            materialScore: data.safetyResult.materialScore,
            irregularityScore: data.safetyResult.irregularityScore,
            siteScore: data.safetyResult.siteScore,
            femaScore: data.safetyResult.femaScore,
            tbdyScore: data.safetyResult.tbdyScore,
            vulnerabilityIndex: data.safetyResult.vulnerabilityIndex,
            mainRiskFactors: data.safetyResult.mainRiskFactors,
            criticalIssues: data.safetyResult.criticalIssues,
            immediateActions: data.safetyResult.immediateActions,
            shortTermActions: data.safetyResult.shortTermActions,
            longTermActions: data.safetyResult.longTermActions,
            estimatedRetrofitCost: data.safetyResult.estimatedRetrofitCost,
            priorityLevel: data.safetyResult.priorityLevel,
            aiAnalysis: data.safetyResult.aiAnalysis,
            aiConfidence: data.safetyResult.aiConfidence,
            calculationMethod: data.safetyResult.calculationMethod,
          }
        } : undefined,

        // Images
        images: data.images && data.images.length > 0 ? {
          create: data.images.map(img => ({
            imageType: img.imageType,
            fileName: img.fileName,
            mimeType: img.mimeType || 'image/jpeg',
            fileSize: img.fileSize,
            imageData: img.imageData,
            thumbnailData: img.thumbnailData,
            capturedAt: img.capturedAt ? new Date(img.capturedAt) : null,
            description: img.description,
            angle: img.angle,
            aiAnalysis: img.aiAnalysis,
          }))
        } : undefined,
      },
      include: {
        location: true,
        buildingInfo: true,
        safetyResult: true,
        images: true,
      }
    });

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      message: 'Assessment saved successfully',
      assessment,
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving assessment:', error);

    return NextResponse.json({
      error: 'Failed to save assessment',
      message: error.message,
    }, { status: 500 });
  }
}
