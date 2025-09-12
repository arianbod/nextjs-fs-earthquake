// Streamlined Assessment Steps
// Reduced from 11 steps to 5 essential steps with intelligent defaults

import LocationStep from './steps/LocationStep';
import WeatherDataStep from './steps/WeatherDataStep';
import BuildingPlanAnalysisStep from './steps/BuildingPlanAnalysisStep';
import BuildingPhotoAnalysisStep from './steps/BuildingPhotoAnalysisStep';
import SmartBuildingReviewStep from './steps/SmartBuildingReviewStep';
import FinalReviewStep from './steps/FinalReviewStep';

/**
 * Streamlined Assessment Flow:
 * 
 * Step 1: Location Detection (ESSENTIAL)
 * - Get GPS coordinates
 * - Detect seismic zone and soil type
 * - Capture Google Street View and satellite images
 * - Analyze neighborhood characteristics
 * 
 * Step 2: Environmental Data (ESSENTIAL - but automated)
 * - Weather and seismic risk analysis
 * - Show collected images gallery
 * - Environmental impact assessment
 * 
 * Step 3: AI Plan Analysis (ESSENTIAL)
 * - User uploads architectural plans/drawings
 * - AI extracts building dimensions and structural layout
 * - Plan analysis provides foundation data
 * 
 * Step 4: AI Photo Analysis (ESSENTIAL)
 * - User uploads building exterior photos
 * - AI verifies and complements plan analysis
 * - Creates comprehensive building assessment
 * - Combined data becomes the MASTER DATA source
 * 
 * Step 5: Smart Building Review (NEW - replaces 7 redundant steps)
 * - Shows ALL AI-detected building characteristics
 * - Pre-filled with intelligent defaults
 * - User can review and modify if needed
 * - Consolidates: BuildingInfo, StructuralSystem, Irregularity, 
 *   PlanDefinition, SpecificConditions, ExtraLoads, NeighborBuildings
 * 
 * Step 6: Final Review (NEW)
 * - Summary of all collected data
 * - Data consistency validation
 * - User confirmation before calculation
 * - Direct path to results
 */

const StreamlinedAssessmentSteps = [
    { 
        component: LocationStep, 
        title: "Location Detection",
        description: "Detect building location and capture satellite/street view images",
        automated: true,
        dataCollected: ['coordinates', 'seismicZone', 'soilType', 'streetViewImages']
    },
    { 
        component: WeatherDataStep, 
        title: "Environmental Analysis",
        description: "Analyze weather patterns and display collected images",
        automated: true,
        dataCollected: ['weatherData', 'environmentalRisks', 'imageGallery']
    },
    { 
        component: BuildingPlanAnalysisStep, 
        title: "AI Plan Analysis",
        description: "Upload architectural plans for AI structural analysis",
        userInput: true,
        dataCollected: ['buildingDimensions', 'structuralLayout', 'planAnalysis']
    },
    { 
        component: BuildingPhotoAnalysisStep, 
        title: "AI Photo Analysis",
        description: "Upload building photos for comprehensive visual assessment",
        userInput: true,
        dataCollected: ['visualVerification', 'structuralCondition', 'combinedAnalysis']
    },
    { 
        component: SmartBuildingReviewStep, 
        title: "Building Review",
        description: "Review and confirm AI-detected building characteristics",
        smartDefaults: true,
        dataCollected: ['confirmedBuildingData', 'userModifications']
    },
    { 
        component: FinalReviewStep, 
        title: "Final Review",
        description: "Confirm all assessment data before generating results",
        validation: true,
        dataCollected: ['dataValidation', 'userConfirmation']
    }
];

export default StreamlinedAssessmentSteps;

/**
 * Data Flow in Streamlined Assessment:
 * 
 * 1. LocationStep → Collects location data, captures Google images
 * 2. WeatherDataStep → Shows environmental data + image gallery
 * 3. BuildingPlanAnalysisStep → AI analyzes architectural plans → Plan data created
 * 4. BuildingPhotoAnalysisStep → AI analyzes photos + plan context → MASTER DATA created
 * 5. SmartBuildingReviewStep → Shows combined AI data with smart defaults → User can modify
 * 6. FinalReviewStep → Validates consistency → Confirms data → Results
 * 
 * Benefits:
 * - Reduced from 11 steps to 6 steps
 * - Separated plan and photo analysis for better accuracy
 * - No redundant data entry
 * - Combined AI analysis is the single source of truth
 * - Smart defaults reduce user effort
 * - Data consistency guaranteed
 * - Faster assessment completion
 */

export const getStepProgress = (currentStep) => {
    return {
        currentStep: currentStep + 1,
        totalSteps: StreamlinedAssessmentSteps.length,
        progress: ((currentStep + 1) / StreamlinedAssessmentSteps.length) * 100,
        isNearComplete: currentStep >= 3
    };
};

export const getStepMetadata = (stepIndex) => {
    const step = StreamlinedAssessmentSteps[stepIndex];
    if (!step) return null;

    return {
        ...step,
        stepNumber: stepIndex + 1,
        totalSteps: StreamlinedAssessmentSteps.length,
        isAutomated: step.automated || false,
        requiresUserInput: step.userInput || false,
        hasSmartDefaults: step.smartDefaults || false,
        hasValidation: step.validation || false
    };
};